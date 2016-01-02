from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import Task, TaskUser
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from ..forms import TaskForm, TaskUserForm
from .getpager import getpager


@login_required
def task_edit(request, pk=None):
    instance = Task.objects.filter(pk=pk).first()
    if request.method == "POST":
        form = TaskForm(request.POST, user=request.user.userprofile, instance=instance)
        if form.is_valid():
            return HttpResponseRedirect(reverse('task', args=[form.save().pk]))
    else:
        form = TaskForm(user=request.user.userprofile, instance=instance)
    return render(request, 'main/task/edit.html', {'form': form})


def task(request, pk):
    _task = get_object_or_404(Task, pk=pk)
    form = None
    if _task.status and hasattr(request.user, 'userprofile'):
        offer = TaskUser.objects.filter(user=request.user.userprofile, task=_task).all()
        offer = offer[0] if offer.count() > 0 else None
        if request.method == "POST":
            if offer and 'delete' in request.POST:
                offer.delete()
                return HttpResponseRedirect(reverse('task', args=[pk]))
            form = TaskUserForm(request.POST, user=request.user.userprofile, task=_task, instance=offer)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(reverse('task', args=[pk]))
        else:
            form = TaskUserForm(user=request.user.userprofile, task=_task, instance=offer)
    return render(request, 'main/task/detail.html', {
        'task': _task,
        'form': form,
    })


def task_all(request):
    return render(request, 'main/task/all.html', {
        'tasks': getpager(
            Task.objects.order_by('-status', '-timestamp_create'),
            request.GET.get('page')
        )
    })
