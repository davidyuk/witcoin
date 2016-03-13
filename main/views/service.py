from ..models import Service
from django.http import HttpResponseNotFound
from django.core.urlresolvers import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth.views import redirect_to_login


class ServiceCreateView(CreateView):
    fields = ['title', 'description', 'price', 'published']
    model = Service
    template_name = 'main/edit.html'

    def form_valid(self, form):
        form.instance.author = self.request.user.userprofile
        return super().form_valid(form)

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


class ServiceUpdateView(UpdateView):
    fields = ['title', 'description', 'price', 'published']
    model = Service
    template_name = 'main/edit.html'

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        if self.get_object().author != self.request.user.userprofile:
            return redirect_to_login(request.get_full_path())
        return super().dispatch(request, *args, **kwargs)


class ServiceDeleteView(DeleteView):
    model = Service
    template_name = 'main/delete.html'
    success_url = reverse_lazy('service_all')

    @method_decorator(login_required())
    def dispatch(self, request, *args, **kwargs):
        if self.get_object().author != self.request.user.userprofile:
            return redirect_to_login(request.get_full_path())
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Услуга успешно удалена')
        return super().delete(request, args, kwargs)


class ServiceDetailView(DetailView):
    model = Service
    template_name = 'main/service/detail.html'

    def dispatch(self, request, *args, **kwargs):
        obj = self.get_object()
        if not obj.published and (not self.request.user.is_authenticated() or obj.author.user != self.request.user):
            return HttpResponseNotFound()
        return super().dispatch(request, *args, **kwargs)


class ServiceListView(ListView):
    model = Service
    paginate_by = 10
    template_name = 'main/service/all.html'
    ordering = ['-created_at']

    def get_queryset(self):
        f = Q(published=True)
        if self.request.user.is_authenticated():
            f |= Q(author__user=self.request.user)
        return Service.objects.filter(f)
