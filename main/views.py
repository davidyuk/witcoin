from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from .models import *
from django.db.models import Avg, Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login


def index(request):
    return render(request, 'main/index.html', {
        'users_top': sorted(UserProfile.objects.all(), key=lambda a: a.balance())[:5],
        'users_last': sorted(UserProfile.objects.all(), key=lambda a: a.user.date_joined)[:5],
        'users_count': UserProfile.objects.count(),
        'money_all': 10000,
        'money_avg': Transaction.objects.aggregate(Avg('amount'))['amount__avg'],
    })


def getpager(objects, page=1, objects_per_page=25):
    paginator = Paginator(objects, objects_per_page)
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def user(request, username):
    user = get_object_or_404(User, username=username)
    return render(request, 'main/userpage.html', {
        'profile': get_object_or_404(UserProfile, pk=user.id),
        'contacts': Contact.objects.filter(user=user.id),
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=user.id) | Q(user_from=user.id)),
            request.GET.get('page')
        )
    })


@login_required
def home(request):
    return HttpResponseRedirect(reverse('user', args=[request.user.username]))


def transactions(request):
    return render(request, 'main/transactions.html', {
        'transactions': getpager(
            Transaction.objects.all(),
            request.GET.get('page')
        )
    })