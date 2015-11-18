from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum


class Group(models.Model):
    name = models.CharField('Название', max_length=100)

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.OneToOneField(User)
    about = models.TextField()
    group = models.ForeignKey(Group, verbose_name='Группа', default=None)

    def __str__(self):
        s = self.user.first_name + ' ' + self.user.last_name
        s = self.user.username if s == ' ' else s
        return s
