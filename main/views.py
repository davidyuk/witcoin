from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from .models import UserProfile, Transaction, Task, TaskUser, FefuMail
from django.db.models import Avg, Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from .forms import UserCreationForm, UserEditingForm, UserProfileCreationForm, UserProfileEditingForm,\
    FefuMailRegisterForm, TransactionCreationForm, TaskForm, TaskUserForm
from django.contrib.auth import authenticate, login, forms as auth_forms, update_session_auth_hash, views as auth_views
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.template.context import RequestContext
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.contrib import messages
from django.utils.http import urlsafe_base64_decode


def index(request):
    users = UserProfile.objects.all()
    return render(request, 'main/index.html', {
        'users_top_spend': sorted(users, key=lambda a: a.spend(), reverse=True)[:4],
        'users_top_balance': sorted(users, key=lambda a: a.balance(), reverse=True)[:4],
        'users_last': UserProfile.objects.order_by('-user__date_joined')[:4],
        'users_count': UserProfile.objects.count(),
        'money_all': -UserProfile.objects.get(pk=1).balance(),
        'money_avg': Transaction.objects.filter(status=True).exclude(user_from=1).aggregate(Avg('amount'))['amount__avg'] or 0,
        'tasks_last': Task.objects.filter(status=True).order_by('-timestamp_create')[:10],
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
    user_form = profile_form = password_form = None
    if request.method == "POST" and request.POST.get('form_type', None) == 'userProfile':
        user_form = UserEditingForm(data=request.POST, instance=request.user)
        profile_form = UserProfileEditingForm(data=request.POST, instance=request.user.userprofile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Параметры успешно сохранены')
            return HttpResponseRedirect(reverse('settings'))

    if request.method == "POST" and request.POST.get('form_type', None) == 'password':
        password_form = auth_forms.PasswordChangeForm(request.user, data=request.POST)
        if password_form.is_valid():
            password_form.save()
            update_session_auth_hash(request, password_form.user)
            messages.success(request, 'Пароль успешно изменён')
            return HttpResponseRedirect(reverse('settings'))

    if not user_form or not profile_form:
        user_form = UserEditingForm(instance=request.user)
        profile_form = UserProfileEditingForm(instance=request.user.userprofile)
    if not password_form:
        password_form = auth_forms.PasswordChangeForm(request.user)

    return render(request, 'main/settings.html', {
        'userForm': user_form,
        'userProfileForm': profile_form,
        'passwordForm': password_form,
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
    profile = get_object_or_404(UserProfile, user__username=username)
    return render(request, 'main/userpage.html', {
        'profile': profile,
        'transactions': getpager(
            Transaction.objects.filter(Q(user_to=profile) | Q(user_from=profile)).order_by('-timestamp_create'),
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


@login_required
def task_edit(request, pk=None):
    instance = Task.objects.filter(pk=pk).first()
    if request.method == "POST":
        form = TaskForm(request.POST, user=request.user.userprofile, instance=instance)
        if form.is_valid():
            return HttpResponseRedirect(reverse('task', args=[form.save().pk]))
    else:
        form = TaskForm(user=request.user.userprofile, instance=instance)
    return render(request, 'main/task/edit.html', {'form': form})


def task(request, pk):
    _task = get_object_or_404(Task, pk=pk)
    form = None
    if _task.status:
        offer = TaskUser.objects.filter(user=request.user.userprofile, task=_task).all()
        offer = offer[0] if offer.count() > 0 else None
        if request.method == "POST":
            if offer and 'delete' in request.POST:
                offer.delete()
                return HttpResponseRedirect(reverse('task', args=[pk]))
            form = TaskUserForm(request.POST, user=request.user.userprofile, task=_task, instance=offer)
            if form.is_valid():
                form.save()
                return HttpResponseRedirect(reverse('task', args=[pk]))
        else:
            form = TaskUserForm(user=request.user.userprofile, task=_task, instance=offer)
    return render(request, 'main/task/detail.html', {
        'task': _task,
        'form': form,
    })


def task_all(request):
    return render(request, 'main/task/all.html', {
        'tasks': getpager(
            Task.objects.order_by('-status', '-timestamp_create'),
            request.GET.get('page')
        )
    })


def password_reset_done(request):
    messages.info(request, 'На указанный вами email отправлено письмо с' +
                  ' дальнейшими инструкциями по восстановлению пароля.')
    return HttpResponseRedirect(reverse('login'))


def password_reset_confirm(request, uidb64, token):
    template_response = auth_views.password_reset_confirm(request, uidb64=uidb64, token=token)

    if template_response.status_code == HttpResponseRedirect.status_code:
        try:
            uid = urlsafe_base64_decode(uidb64)
            _user = UserProfile.objects.get(user__pk=uid).user
        except (TypeError, ValueError, OverflowError, UserProfile.DoesNotExist):
            pass
        else:
            _user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, _user)

    if hasattr(template_response, 'context_data') and not template_response.context_data['validlink']:
        messages.error(request, 'Ссылка для сброса пароля недействительна.')
        return HttpResponseRedirect(reverse('login'))

    return template_response


@login_required
def password_reset_complete(request):
    messages.success(request, 'Пароль успешно изменён.')
    return HttpResponseRedirect(reverse('user', args=[request.user.username]))
