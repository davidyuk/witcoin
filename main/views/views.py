from django.shortcuts import render
from main.models import UserProfile, Transaction, Task, Service
from django.db.models import Avg
from voting.models import Vote


def index(request):
    users = UserProfile.objects.all()

    tasks_last = Task.objects.filter(status=True).order_by('-timestamp_create')[:10]
    votes = Vote.objects.get_scores_in_bulk(tasks_last)
    tasks_last = list(filter(lambda x: x.id not in votes or votes[x.id]['score'] > 0, tasks_last))

    services_last = Service.objects.filter(published=True).order_by('-created_at')[:10]
    votes = Vote.objects.get_scores_in_bulk(services_last)
    services_last = list(filter(lambda x: x.id not in votes or votes[x.id]['score'] > 0, services_last))

    return render(request, 'main/index.html', {
        'users_top_spend': sorted(users, key=lambda a: a.spend(), reverse=True)[:4],
        'users_top_balance': sorted(users, key=lambda a: a.balance(), reverse=True)[:4],
        'users_last': UserProfile.objects.order_by('-user__date_joined')[:4],
        'users_count': UserProfile.objects.count(),
        'money_all': -UserProfile.objects.get(pk=1).balance(),
        'money_avg': Transaction.objects.filter(status=True).exclude(user_from=1).aggregate(Avg('amount'))['amount__avg'] or 0,
        'tasks': tasks_last,
        'services': services_last,
    })
