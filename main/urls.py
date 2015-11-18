from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^id(?P<user_id>[0-9]+)$', views.user, name='user'),
    url(r'^transactions$', views.transactions, name='transactions'),
    url(r'^$', views.index, name='index'),
]