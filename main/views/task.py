from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import Task, TaskUser
from django.core.urlresolvers import reverse, reverse_lazy
from ..forms import TaskUserForm
from django.views.generic.list import ListView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.contrib.auth.views import redirect_to_login
from django.contrib import messages


class TaskCreateView(CreateView):
    fields = ['title', 'description', 'tags']
    model = Task
    template_name = 'main/edit.html'

    def form_valid(self, form):
        form.instance.author = self.request.user.userprofile
        return super().form_valid(form)

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class TaskUpdateView(UpdateView):
    fields = ['title', 'description', 'tags', 'status']
    model = Task
    template_name = 'main/edit.html'

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        if self.get_object().author != self.request.user.userprofile:
            return redirect_to_login(request.get_full_path())
        return super().dispatch(request, *args, **kwargs)


class TaskDeleteView(DeleteView):
    model = Task
    template_name = 'main/delete.html'
    success_url = reverse_lazy('task_all')

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        if self.get_object().author != self.request.user.userprofile:
            return redirect_to_login(request.get_full_path())
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Задание успешно удалено')
        return super().delete(request, args, kwargs)


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


class TaskListView(ListView):
    model = Task
    paginate_by = 10
    template_name = 'main/task/all.html'
    ordering = ['-status', '-timestamp_create']

    def get_queryset(self):
        q = super().get_queryset()
        t = self.request.GET.get('tag')
        return q.filter(tags__slug=t) if t is not None else q
