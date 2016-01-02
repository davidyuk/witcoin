from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import Transaction
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from ..forms import TransactionCreationForm
from django.utils import timezone
from django.views.generic.list import ListView


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


class TransactionListView(ListView):
    model = Transaction
    paginate_by = 20
    template_name = 'main/transaction/all.html'
    ordering = '-timestamp_create'
