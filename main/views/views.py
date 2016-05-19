from django.shortcuts import render
from main.models import UserProfile, Task, Service
from voting.models import Vote


def index(request):
    users = UserProfile.objects.all()

    tasks_last = Task.objects.filter(status=True, published=True).order_by('-timestamp_create')[:10]
    votes = Vote.objects.get_scores_in_bulk(tasks_last)
    tasks_last = list(filter(lambda x: x.id not in votes or votes[x.id]['score'] > 0, tasks_last))

    services_last = Service.objects.filter(published=True).order_by('-created_at')[:10]
    votes = Vote.objects.get_scores_in_bulk(services_last)
    services_last = list(filter(lambda x: x.id not in votes or votes[x.id]['score'] > 0, services_last))

    return render(request, 'main/index.html', {
        'users_top_balance': sorted(users, key=lambda a: a.balance(), reverse=True)[:6],
        'users_last': UserProfile.objects.order_by('-user__date_joined')[:6],
        'users_count': UserProfile.objects.count(),
        'money_all': -UserProfile.objects.get(pk=1).balance(),
        'tasks': tasks_last,
        'services': services_last,
    })
