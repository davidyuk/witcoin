from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.sites.models import Site
from actstream.models import Action, followers

import django_comments

from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.template.context import Context

from functools import reduce
import re


def create_action_email(context, email, connection):
    message = EmailMultiAlternatives(
        re.sub('\s+', ' ', render_to_string('main/email/action_subject.txt', context)),
        render_to_string('main/email/action.txt', context),
        None, [email], connection=connection)
    message.attach_alternative(
        re.sub('\s+', ' ', render_to_string('main/email/action.html', context)), 'text/html')
    return message


def send_action_mail(action):
    users = reduce(lambda res, x: (res | set(followers(x))) if x else res,
                   [action.actor, action.action_object, action.target], set())

    connection = get_connection(fail_silently=True)
    site = Site.objects.get(pk=1)
    messages = []
    emails = set()
    if hasattr(action.actor, 'email'):
        emails.add(action.actor.email)
    for user in users:
        if user.email in emails:
            continue
        messages.append(create_action_email(
            Context({'action': action, 'user': user, 'site': site}), user.email, connection))
        emails.add(user.email)

    if isinstance(action.action_object, django_comments.get_model()) and action.action_object.parent \
            and not action.action_object.parent.user and action.action_object.parent.email not in emails:
        messages.append(create_action_email(
            Context({'action': action, 'user_name': action.action_object.parent.name, 'site': site}),
            action.action_object.parent.email, connection))

    connection.send_messages(messages)


@receiver(post_save, sender=Action, weak=False)
def handler(sender, instance, created, raw, **kwargs):
    if created and not raw:
        send_action_mail(instance)
