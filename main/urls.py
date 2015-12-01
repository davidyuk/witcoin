from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^register$', views.register, name='register'),
    url(r'^home$', views.home, name='home'),
    url(r'^user/(?P<username>[A-zА-я0-9_-]+)$', views.user, name='user'),
    url(r'^transactions$', views.transactions, name='transactions'),
    url(r'^$', views.index, name='index'),
]