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
    url(r'^transaction/all$', views.transaction_all, name='transaction_all'),
    url(r'^transaction/create$', views.transaction_create, name='transaction_create'),
    url(r'^$', views.index, name='index'),
]
