from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from ..models import Transaction, FefuMail
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from ..forms import FefuMailRegisterForm
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.template.context import RequestContext
from django.utils.crypto import get_random_string
from django.utils import timezone
from django.contrib import messages

import re


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
                    if send_mail(re.sub('\n', '', render_to_string('main/email/fefu_subject.txt', context)),
                                 render_to_string('main/email/fefu.txt', context), None, [instance.email],
                                 html_message=render_to_string('main/email/fefu.html', context)) == 1:
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
