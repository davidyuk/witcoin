from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum


class Group(models.Model):
    name = models.CharField('Название', max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'


class UserProfile(models.Model):
    user = models.OneToOneField(User)
    about = models.TextField('О себе', blank=True)
    group = models.ForeignKey(Group, verbose_name='Группа')

    def earned(self):
        return self.user.transactions_from.aggregate(Sum('amount'))['amount__sum']

    def spend(self):
        return self.user.transactions_to.aggregate(Sum('amount'))['amount__sum']

    def balance(self):
        try:
            return self.earned() - self.spend()
        except:
            return 0

    def __str__(self):
        s = self.user.first_name + ' ' + self.user.last_name
        s = self.user.username if s == ' ' else s
        return s

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'


class TransactionStatus(models.Model):
    name = models.CharField('Название', max_length=100)
    icon = models.CharField('Название иконки bootstrap', max_length=100, default='')
    color = models.CharField('Цвет иконки bootstrap', max_length=100, default='')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Статус транзакции'
        verbose_name_plural = 'Статусы транзакций'


class Transaction(models.Model):
    user_from = models.ForeignKey(UserProfile, verbose_name='От кого', related_name='transactions_from')
    user_to = models.ForeignKey(UserProfile, verbose_name='Кому', related_name='transactions_to')
    description = models.CharField('Описание', max_length=500)
    amount = models.FloatField('Сумма', default=0)
    timestamp_create = models.DateTimeField('Дата создания', auto_now_add=True)
    timestamp_confirm = models.DateTimeField('Дата подтверждения', blank=True)
    status = models.ForeignKey(TransactionStatus, verbose_name='Статус', default=1)

    def timestamp(self):
        return max(self.timestamp_create, self.timestamp_confirm)

    def __str__(self):
        return 'От: %s, кому: %s, количество: %s' % (self.user_from, self.user_to, self.amount)

    class Meta:
        verbose_name = 'Транзакция'
        verbose_name_plural = 'Транзакции'
