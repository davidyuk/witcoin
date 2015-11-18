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


class Transaction(models.Model):
    user_from = models.ForeignKey(User, verbose_name='От кого', related_name='transactions_from')
    user_to = models.ForeignKey(User, verbose_name='Кому', related_name='transactions_to')
    description = models.CharField('Описание', max_length=500)
    amount = models.FloatField('Сумма', default=0)
    timestamp = models.DateTimeField('Дата создания')
    status = models.PositiveSmallIntegerField('Статус', default=0)

    def isPaid(self):
        return self.status == 1

    def __str__(self):
        return 'От: %s, кому: %s, количество: %s' % (self.user_from, self.user_to, self.amount)
