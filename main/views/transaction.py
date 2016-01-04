from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import Transaction
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from ..forms import TransactionCreationForm
from django.utils import timezone
from django_filters import FilterSet, MethodFilter, TypedChoiceFilter, RangeFilter, DateFromToRangeFilter
from django_filters.views import FilterView
from django.db.models import Q
from distutils.util import strtobool
from functools import reduce
from operator import and_, or_


@login_required
def transaction_create(request):
    if request.method == "POST":
        form = TransactionCreationForm(request.POST, user=request.user.userprofile)
        if form.is_valid():
            form.save()
            if 'from' in request.GET:
                return HttpResponseRedirect(request.GET['from'])
            else:
                return HttpResponseRedirect(reverse('user', args=[request.user.username]))
    else:
        form = TransactionCreationForm(user=request.user.userprofile)
    return render(request, 'main/transaction/create.html', {'form': form})


def transaction(request, pk):
    trans = get_object_or_404(Transaction, pk=pk)
    status_editable = \
        trans.status is None and request.user.is_authenticated()\
        and request.user.userprofile in [trans.user_to, trans.user_from]
    if request.method == "POST" and status_editable:
        if request.user.userprofile == trans.user_from:
            if request.POST['status'] != 'ok' or request.user.userprofile.balance() >= trans.amount:
                trans.status = request.POST['status'] == 'ok'
                trans.timestamp_confirm = timezone.now()
                trans.save()
            return HttpResponseRedirect(reverse('transaction', args=[trans.pk]))
        else:
            trans.delete()
            return HttpResponseRedirect(reverse('user', args=[request.user.username]))

    return render(request, 'main/transaction/detail.html', {
        'transaction': trans,
        'status_editable': status_editable
    })


class TransactionFilterView(FilterView):
    paginate_by = 20
    template_name = 'main/transaction/all.html'

    class filterset_class(FilterSet):
        amount = RangeFilter(label='Сумма')
        user = MethodFilter(label='Участник')
        user_to = MethodFilter(label='Получатель')
        user_from = MethodFilter(label='Отправитель')
        timestamp_create = DateFromToRangeFilter(label='Дата создания')
        STATUS_CHOICES = (
            (None, 'Все'),
            (True, 'Подтверждённые'),
            (False, 'Отменённые'),
        )
        status = TypedChoiceFilter(label='Статус', choices=STATUS_CHOICES, coerce=strtobool)

        @staticmethod
        def get_user_to_q(value):
            return Q(user_to__user__first_name__contains=value) | Q(user_to__user__last_name__contains=value)

        @staticmethod
        def get_user_from_q(value):
            return Q(user_from__user__first_name__contains=value) | Q(user_from__user__last_name__contains=value)

        @staticmethod
        def get_user_q(value, q_list):
            return reduce(and_, map(lambda s: reduce(or_, map(lambda f: f(s), q_list), Q()), value.split()), Q())

        def filter_user(self, queryset, value):
            return queryset.filter(self.get_user_q(value, [self.get_user_to_q, self.get_user_from_q]))

        def filter_user_to(self, queryset, value):
            return queryset.filter(self.get_user_q(value, [self.get_user_to_q]))

        def filter_user_from(self, queryset, value):
            return queryset.filter(self.get_user_q(value, [self.get_user_from_q]))

        def __init__(self, *args, **kwargs):
            # remove useless help_text 'Filter'
            # https://github.com/alex/django-filter/issues/292
            for _, f in self.base_filters.items():
                f.field.help_text = {}
            super().__init__(*args, **kwargs)
            self.form.fields['o'].label = 'Сортировать по'
            self.form.fields['user_to'].advanced = True
            self.form.fields['user_from'].advanced = True
            self.form.fields['amount'].advanced = True
            self.form.fields['timestamp_create'].advanced = True

        class Meta:
            model = Transaction
            fields = ['status', 'amount', 'timestamp_create']
            order_by = (
                ('-timestamp_create', 'Дата создания'),
                ('-amount', 'Сумма операции'),
                ('-status', 'Статус'),
            )
