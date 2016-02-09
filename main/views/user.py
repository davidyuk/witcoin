from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import UserProfile
from django.db.models import Q
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from ..forms import UserCreationForm, UserEditingForm, UserProfileCreationForm, UserProfileEditingForm
from django.contrib.auth import authenticate, login, forms as auth_forms, update_session_auth_hash, views as auth_views
from django.contrib import messages
from django.utils.http import urlsafe_base64_decode


def user(request, username):
    profile = get_object_or_404(UserProfile, user__username=username)

    return render(request, 'main/user/detail.html', {
        'profile': profile,
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

    return render(request, 'main/user/settings.html', {
        'userForm': user_form,
        'userProfileForm': profile_form,
        'passwordForm': password_form,
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


@login_required
def home(request):
    return HttpResponseRedirect(reverse('user', args=[request.user.username]))
