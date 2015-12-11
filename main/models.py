from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
from django.core.validators import MinValueValidator, RegexValidator


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
    group = models.ForeignKey(Group, verbose_name='Группа', default=1)

    def earned(self):
        r = self.transactions_to.filter(status=True).aggregate(Sum('amount'))['amount__sum']
        return r if r is not None else 0

    def spend(self):
        r = self.transactions_from.filter(status=True).aggregate(Sum('amount'))['amount__sum']
        return r if r is not None else 0

    def balance(self):
        return self.earned() - self.spend()

    def __str__(self):
        s = self.user.first_name + ' ' + self.user.last_name
        s = self.user.username if s == ' ' else s
        return s

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'


class Transaction(models.Model):
    user_from = models.ForeignKey(UserProfile, verbose_name='Отправитель', related_name='transactions_from')
    user_to = models.ForeignKey(UserProfile, verbose_name='Получатель', related_name='transactions_to')
    description = models.CharField('Описание', max_length=500)
    amount = models.DecimalField('Сумма', default=0, max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    timestamp_create = models.DateTimeField('Дата создания', auto_now_add=True)
    timestamp_confirm = models.DateTimeField('Дата подтверждения', null=True, blank=True)
    status = models.NullBooleanField('Статус', null=True, blank=True)

    def __str__(self):
        st = 'ожидание' if self.status is None else 'передано' if self.status else 'отменено'
        return 'От: %s, кому: %s, количество: %s (%s)' % (self.user_from, self.user_to, self.amount, st)

    class Meta:
        verbose_name = 'Транзакция'
        verbose_name_plural = 'Транзакции'


class FefuMail(models.Model):
    user = models.OneToOneField(UserProfile)
    email = models.EmailField()
    status = models.BooleanField('Статус', default=False)
    token = models.CharField('Ключ для регистрации', validators=[RegexValidator(regex='^[0-9A-z]{32}$',
                                                                                message='Неправильный ключ')],
                             max_length=32, default='0000000000000000000000000000000000000000')
