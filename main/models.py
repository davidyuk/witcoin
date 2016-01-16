from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
from django.core.validators import MinValueValidator, RegexValidator


class Group(models.Model):
    name = models.CharField('название', max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'группа'
        verbose_name_plural = 'группы'


class UserProfile(models.Model):
    user = models.OneToOneField(User, verbose_name='пользователь')
    about = models.TextField('о себе', blank=True)
    group = models.ForeignKey(Group, verbose_name='группа', default=1)

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
        ordering = ['user__first_name']
        verbose_name = 'профиль пользователя'
        verbose_name_plural = 'профили пользователей'


class Transaction(models.Model):
    user_from = models.ForeignKey(UserProfile, verbose_name='отправитель', related_name='transactions_from')
    user_to = models.ForeignKey(UserProfile, verbose_name='получатель', related_name='transactions_to')
    description = models.CharField('описание', max_length=500)
    amount = models.DecimalField('сумма', default=0, max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    timestamp_create = models.DateTimeField('дата создания', auto_now_add=True)
    timestamp_confirm = models.DateTimeField('дата подтверждения', null=True, blank=True)
    status = models.NullBooleanField('статус', null=True, blank=True)

    def __str__(self):
        st = 'ожидание' if self.status is None else 'передано' if self.status else 'отменено'
        return 'От: %s, кому: %s, количество: %s (%s)' % (self.user_from, self.user_to, self.amount, st)

    class Meta:
        verbose_name = 'транзакция'
        verbose_name_plural = 'транзакции'


class Task(models.Model):
    author = models.ForeignKey(UserProfile, verbose_name='автор')
    title = models.CharField('заголовок', max_length=100)
    description = models.CharField('описание', blank=True, max_length=5000)
    timestamp_create = models.DateTimeField('дата создания', auto_now_add=True)
    status = models.BooleanField('актуально', default=True)

    def __str__(self):
        return '%s (%s)' % (self.title, self.author)

    class Meta:
        verbose_name = 'задание'
        verbose_name_plural = 'задания'


class TaskUser(models.Model):
    task = models.ForeignKey(Task, verbose_name='задание', related_name='offers')
    user = models.ForeignKey(UserProfile, verbose_name='пользователь')
    price = models.DecimalField('стоимость', null=True, blank=True, max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    description = models.CharField('комментарий', blank=True, max_length=1000)
    timestamp_create = models.DateTimeField('дата создания', auto_now_add=True)

    def __str__(self):
        return '%s для задания %s' % (self.user, self.task)

    class Meta:
        verbose_name = 'предложение'
        verbose_name_plural = 'предложения'


class FefuMail(models.Model):
    user = models.OneToOneField(UserProfile)
    email = models.EmailField()
    status = models.BooleanField('статус', default=False)
    token = models.CharField('ключ для регистрации', validators=[RegexValidator(regex='^[0-9A-z]{32}$',
                                                                                message='Неправильный ключ')],
                             max_length=32, default='0000000000000000000000000000000000000000')
