from django.dispatch import receiver

from actstream import action
from actstream.actions import follow
from actstream.models import Action

from django.db.models.signals import post_save
from ..models import Task, TaskUser, Transaction
from django_comments.signals import comment_was_posted


@receiver(post_save, sender=Task, weak=False)
def handler(sender, instance, created, raw, **kwargs):
    if created and not raw:
        follow(instance.author.user, instance, actor_only=False, send_action=False)
        action.send(instance.author.user, verb='добавил', action_object=instance, description=instance.description)


@receiver(post_save, sender=TaskUser, weak=False)
def handler(sender, instance, created, raw, **kwargs):
    if created and not raw:
        follow(instance.user.user, instance, actor_only=False, send_action=False)
        d = instance.description + ('\nСтоимость: ' + str(instance.price)) if instance.price else ''
        action.send(instance.user.user, verb='добавил', action_object=instance, description=d, target=instance.task)


@receiver(post_save, sender=Transaction, weak=False)
def handler(sender, instance, created, raw, **kwargs):
    if raw:
        return
    if created:
        follow(instance.user_from.user, instance, actor_only=False, send_action=False)
        follow(instance.user_to.user, instance, actor_only=False, send_action=False)
        action.send(instance.user_from.user if instance.status else instance.user_to.user,
                    verb='перевёл' if instance.status else 'запросил перевод', action_object=instance,
                    description=instance.description)
    else:
        action.send(instance, verb='подтверждена' if instance.status else 'отменена')


@receiver(comment_was_posted, weak=False)
def handler(sender, comment, **kwargs):
    t = comment.parent if comment.parent else comment.content_object
    d = comment.comment
    if comment.user:
        follow(comment.user, comment, actor_only=False, send_action=False)
        action.send(comment.user, target=t, description=d, verb='добавил', action_object=comment)
    else:
        action.send(comment, target=t, description=d, verb='добавлен')
    if comment.parent and not comment.parent.user:
        pass  # todo: send email to anonymous user


@receiver(post_save, sender=Action, weak=False)
def handler(sender, instance, created, raw, **kwargs):
    if created and not raw:
        pass
        # todo: send mail to all followers, but not to actor
