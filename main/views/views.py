from django.shortcuts import render
from main.models import UserProfile, Transaction, Task
from django.db.models import Avg


def index(request):
    users = UserProfile.objects.all()
    return render(request, 'main/index.html', {
        'users_top_spend': sorted(users, key=lambda a: a.spend(), reverse=True)[:4],
        'users_top_balance': sorted(users, key=lambda a: a.balance(), reverse=True)[:4],
        'users_last': UserProfile.objects.order_by('-user__date_joined')[:4],
        'users_count': UserProfile.objects.count(),
        'money_all': -UserProfile.objects.get(pk=1).balance(),
        'money_avg': Transaction.objects.filter(status=True).exclude(user_from=1).aggregate(Avg('amount'))['amount__avg'] or 0,
        'tasks': Task.objects.filter(status=True).order_by('-timestamp_create')[:10],
    })
