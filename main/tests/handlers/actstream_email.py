from django.core import mail
from django.test import TestCase
from ..common import create_task, create_service, create_user_profile, create_comment

from actstream.actions import follow


class EmailTest(TestCase):
    def test_notify(self):
        user1 = create_user_profile()
        user2 = create_user_profile()
        follow(user2.user, user1.user, send_action=False, actor_only=False)
        self.assertEquals(len(mail.outbox), 0)
        create_task(user1)
        self.assertEquals(len(mail.outbox), 1)
        self.assertEquals(mail.outbox[0].to, [user2.user.email])

    def test_notify_comment(self):
        user = create_user_profile()
        task = create_task(user)
        self.assertEquals(len(mail.outbox), 0)
        create_comment(None, None, task, create_user_profile().user)
        self.assertEquals(len(mail.outbox), 1)
        self.assertEquals(mail.outbox[0].to, [user.user.email])

    def test_notify_comment_anonymous(self):
        user = create_user_profile()
        task = create_task(user)
        self.assertEquals(len(mail.outbox), 0)
        anonymous_email = 'anonymous@email.test'
        anonymous_comment = create_comment({'email': anonymous_email}, None, task)
        self.assertEquals(len(mail.outbox), 1)
        self.assertEquals(mail.outbox[0].to, [user.user.email])
        create_comment(None, anonymous_comment, task, create_user_profile().user)
        self.assertEquals(len(mail.outbox), 2)
        self.assertEquals(mail.outbox[1].to, [anonymous_email])

    def test_notify_by_email(self):
        user = create_user_profile()
        user.notify_by_email = False
        user.notify_about_new_tasks = True
        user.notify_about_new_services = True
        user.save()
        create_service()
        t = create_task()
        c = create_comment(None, None, t, user.user)
        create_comment(None, c, t, create_user_profile().user)
        self.assertNotIn(user.user.email, sorted([x.to[0] for x in mail.outbox]))

    def test_notify_about_new_task(self):
        self.assertEquals(len(mail.outbox), 0)
        user1 = create_user_profile()
        user1.notify_about_new_tasks = True
        user1.save()
        create_task()
        self.assertEquals(len(mail.outbox), 1)
        self.assertEquals(mail.outbox[0].to, [user1.user.email])
        user2 = create_user_profile()
        user2.notify_about_new_tasks = True
        user2.save()
        create_task()
        self.assertEquals(len(mail.outbox), 3)
        self.assertEquals(sorted([x.to[0] for x in mail.outbox]),
                          sorted([user1.user.email, user1.user.email, user2.user.email]))

    def test_notify_about_new_services(self):
        user1 = create_user_profile()
        user1.notify_about_new_services = True
        user1.save()
        create_service()
        self.assertEquals(len(mail.outbox), 1)
        self.assertEquals(mail.outbox[0].to, [user1.user.email])
        user2 = create_user_profile()
        user2.notify_about_new_services = True
        user2.save()
        create_service()
        self.assertEquals(len(mail.outbox), 3)
        self.assertEquals(sorted([x.to[0] for x in mail.outbox]),
                          sorted([user1.user.email, user1.user.email, user2.user.email]))
