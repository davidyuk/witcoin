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
