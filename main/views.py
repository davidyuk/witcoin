from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth.models import User
from .models import *
from django.db.models import Avg, Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


def index(request):
    return render(request, 'main/index.html', {
        'users_top': sorted(Profile.objects.all(), key=lambda a: a.balance())[:5],
        'users_last': sorted(Profile.objects.all(), key=lambda a: a.user.date_joined)[:5],
        'users_count': Profile.objects.count(),
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


def user(request, user_id):
    return render(request, 'main/userpage.html', {
        'profile': get_object_or_404(Profile, pk=user_id),
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=user_id)|Q(user_from=user_id)),
            request.GET.get('page')
        )
    })


def transactions(request):
    return render(request, 'main/transactions.html', {
        'transactions': getpager(
            Transaction.objects.all(),
            request.GET.get('page')
        )
    })