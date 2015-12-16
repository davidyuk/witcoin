from django.conf.urls import url
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    url(r'^register$', views.register, name='register'),
    url(r'^login$', auth_views.login, name='login'),
    url(r'^home$', views.home, name='home'),
    url(r'^settings$', views.settings, name='settings'),
    url(r'^logout$', auth_views.logout, {'next_page': '/'}, name='logout'),
    url(r'^user/(?P<username>[A-zА-я0-9_-]+)$', views.user, name='user'),
    url(r'^fefu$', views.fefu_send_mail, name='fefu_send_mail'),
    url(r'^fefu/(?P<token>[0-9A-z]{32})$', views.fefu_from_mail, name='fefu_from_mail'),

    url(r'^transaction/all$', views.transaction_all, name='transaction_all'),
    url(r'^transaction/create$', views.transaction_create, name='transaction_create'),
    url(r'^transaction/(?P<pk>[0-9]+)$', views.transaction, name='transaction'),

    url(r'^task/all$', views.task_all, name='task_all'),
    url(r'^task/create$', views.task_edit, name='task_create'),
    url(r'^task/(?P<pk>[0-9]+)$', views.task, name='task'),
    url(r'^task/(?P<pk>[0-9]+)/edit$', views.task_edit, name='task_edit'),

    url(r'^$', views.index, name='index'),
]
