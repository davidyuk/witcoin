from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from .models import *
from django.db.models import Avg, Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from .forms import *
from django.contrib.auth import authenticate, login
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.template.context import RequestContext
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.contrib import messages


def index(request):
    users = UserProfile.objects.all()
    return render(request, 'main/index.html', {
        'users_top_spend': sorted(users, key=lambda a: a.spend(), reverse=True)[:5],
        'users_top_balance': sorted(users, key=lambda a: a.balance(), reverse=True)[:5],
        'users_last': UserProfile.objects.order_by('-user__date_joined')[:5],
        'users_count': UserProfile.objects.count(),
        'money_all': -UserProfile.objects.get(pk=1).balance(),
        'money_avg': Transaction.objects.filter(status=True).exclude(user_from=1).aggregate(Avg('amount'))['amount__avg'] or 0,
    })


def register(request):
    if request.method == "POST":
        user_form = UserCreationForm(data=request.POST)
        profile_form = UserProfileCreationForm(data=request.POST)
        if user_form.is_valid() and profile_form.is_valid():
            new_user = user_form.save()
            profile_form = profile_form.save(commit=False)
            profile_form.user = new_user
            profile_form.save()
            new_user = authenticate(username=request.POST['username'], password=request.POST['password1'])
            login(request, new_user)
            return HttpResponseRedirect(reverse('user', args=[new_user.username]))
    else:
        user_form = UserCreationForm()
        profile_form = UserProfileCreationForm()
    return render(request, 'registration/register.html', {
        'userForm': user_form, 'userProfileForm': profile_form
    })


@login_required
def settings(request):
    if request.method == "POST":
        user_form = UserEditingForm(data=request.POST, instance=request.user)
        profile_form = UserProfileEditingForm(data=request.POST, instance=request.user.userprofile)
        if user_form.is_valid() and profile_form.is_valid():
            curr_user = user_form.save()
            profile_form.save()
            return HttpResponseRedirect(reverse('user', args=[request.user.username]))
    else:
        user_form = UserEditingForm(instance=request.user)
        profile_form = UserProfileEditingForm(instance=request.user.userprofile)
    return render(request, 'main/settings.html', {
        'userForm': user_form, 'userProfileForm': profile_form
    })


def getpager(objects, page=1, objects_per_page=25):
    paginator = Paginator(objects, objects_per_page)
    try:
        return paginator.page(page)
    except PageNotAnInteger:
        return paginator.page(1)
    except EmptyPage:
        return paginator.page(paginator.num_pages)


def user(request, username):
    _user = get_object_or_404(User, username=username)
    return render(request, 'main/userpage.html', {
        'profile': _user.userprofile,
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=_user.id) | Q(user_from=_user.id)).order_by('-timestamp_create'),
            request.GET.get('page')
        )
    })


@login_required
def fefu_send_mail(request):
    user = request.user.userprofile
    instance = FefuMail.objects.filter(user=user).all()
    instance = instance[0] if instance.count() > 0 else None
    mail_last = instance.email if instance is not None else ''
    form = None
    if not instance or not instance.status:
        if request.method == "POST":
            form = FefuMailRegisterForm(data=request.POST, instance=instance, user=user)
            if form.is_valid():
                instance = form.save(commit=False)
                instance.token = get_random_string(length=32)
                context = RequestContext(request, {'token': instance.token})
                try:
                    if send_mail('Регистрация email ДВФУ.', render_to_string('main/fefu_mail/mail.txt', context), None,
                                 [instance.email], html_message=render_to_string('main/fefu_mail/mail.html', context)) == 1:
                        instance.save()
                        messages.success(request, 'Письмо успешно отправленно на %s.' % instance.email)
                    else:
                        messages.error(request, 'Произошла ошибка при отправке письма.')
                except ConnectionRefusedError:
                    messages.error(request, 'Ошибка подключения к почтовому серверу.')
                return HttpResponseRedirect(reverse(fefu_send_mail))
        else:
            form = FefuMailRegisterForm(instance=instance, user=user)
    else:
        messages.info(request, 'Email %s уже зарегистрирован.' % instance.email)
    return render(request, 'main/fefu_mail/form.html', {
        'form': form,
        'mail_last': mail_last,
    })


def fefu_from_mail(request, token):
    instance = get_object_or_404(FefuMail, token=token)
    if instance.status:
        return HttpResponseRedirect(reverse(fefu_send_mail))
    instance.status = True
    instance.save()
    Transaction.objects.create(user_from_id=1, user_to=instance.user, amount=10, status=True,
                               timestamp_confirm=timezone.now(),
                               description='Зарегистрирован email студента ДВФУ: %s.' % instance.email)
    messages.info(request, 'Email %s успешно зарегистрирован.' % instance.email)
    return render(request, 'main/fefu_mail/form.html')


@login_required
def home(request):
    return HttpResponseRedirect(reverse('user', args=[request.user.username]))


@login_required
def transaction_create(request):
    if request.method == "POST":
        form = TransactionCreationForm(request.POST, user=request.user.userprofile)
        if form.is_valid():
            form.save()
            if 'from' in request.GET:
                return HttpResponseRedirect(request.GET['from'])
            else:
                return HttpResponseRedirect(reverse('user', args=[request.user.username]))
    else:
        form = TransactionCreationForm(user=request.user.userprofile)
    return render(request, 'main/transaction_create.html', {'form': form})


def transaction(request, pk):
    trans = get_object_or_404(Transaction, pk=pk)
    status_editable = \
        trans.status is None and request.user.is_authenticated()\
        and request.user.userprofile in [trans.user_to, trans.user_from]
    if request.method == "POST" and status_editable:
        if request.user.userprofile == trans.user_from:
            if request.POST['status'] != 'ok' or request.user.userprofile.balance() >= trans.amount:
                trans.status = request.POST['status'] == 'ok'
                trans.timestamp_confirm = timezone.now()
                trans.save()
            return HttpResponseRedirect(reverse('transaction', args=[trans.pk]))
        else:
            trans.delete()
            return HttpResponseRedirect(reverse('user', args=[request.user.username]))

    return render(request, 'main/transaction.html', {
        'transaction': trans,
        'status_editable': status_editable
    })


def transaction_all(request):
    return render(request, 'main/transaction_all.html', {
        'transactions': getpager(
            Transaction.objects.order_by('-timestamp_create'),
            request.GET.get('page')
        )
    })