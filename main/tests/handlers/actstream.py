from django.test import TestCase
from actstream.models import Action, Follow
from ..common import *


class ActivityStreamTestCase(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def check_follow(self, user, obj, follow=None):
        follow = follow or Follow.objects.filter(user=user.user).latest('id')
        self.assertEqual(follow.user, user.user)
        self.assertEqual(follow.follow_object, obj)
        self.assertFalse(follow.actor_only)

    def check_action(self, actor, verb, action_object, target, desc_list, action=None):
        action = action or Action.objects.latest('id')
        self.assertEqual(action.actor, actor.user)
        self.assertEqual(action.verb, verb)
        self.assertEqual(action.action_object, action_object)
        self.assertEqual(action.target, target)
        for desc in desc_list:
            self.assertIn(str(desc), action.description)

    def test_task_create(self):
        up = create_user_profile()
        t = create_task(author=up)
        self.check_follow(up, t)
        self.check_action(up, 'добавил', t, None, [t.description])

    def test_task_user_create(self):
        up = create_user_profile()
        tu = create_task_user(user=up)
        self.check_follow(up, tu)
        self.check_action(up, 'добавил', tu, tu.task, [tu.description, str(tu.price)])

    def test_transaction_create(self):
        (up_f, up_t) = (create_user_profile(), create_user_profile())
        t = create_transaction(user_from=up_f, user_to=up_t, status=True)
        self.check_follow(up_f, t)
        self.check_follow(up_t, t)
        self.check_action(up_f, 'перевёл', t, None, [t.description])

    def test_transaction_request_create(self):
        (up_f, up_t) = (create_user_profile(), create_user_profile())
        t = create_transaction(user_from=up_f, user_to=up_t, status=False)
        self.check_follow(up_f, t)
        self.check_follow(up_t, t)
        self.check_action(up_t, 'запросил перевод', t, None, [t.description])

    def test_comment_create(self):
        (comment_object, user_profile, comment_text) = (create_task(), create_user_profile(), 'comment_test')
        comment = create_comment({'comment': comment_text}, None, comment_object, user_profile.user)
        self.check_follow(user_profile, comment)
        self.check_action(user_profile, 'добавил', comment, comment_object, [comment_text])

    def test_comment_reply_create(self):
        (comment_object, user_profile, comment_text) = (create_task(), create_user_profile(), 'comment_test')
        comment = create_comment(None, None, comment_object, create_user_profile().user)
        comment_reply = create_comment({'comment': comment_text}, comment, comment_object, user_profile.user)
        self.check_follow(user_profile, comment_reply)
        self.check_action(user_profile, 'добавил', comment_reply, comment, [comment_text])

    def test_service_published(self):
        up = create_user_profile()
        o = create_service(author=up)
        self.check_follow(up, o)
        self.check_action(up, 'опубликовал', o, None, [o.description, o.price])

    def test_service_not_published(self):
        up = create_user_profile()
        o = create_service(author=up, published=False)
        self.check_follow(up, o)
        self.assertEqual(Action.objects.count(), 0)

    def test_service_published_hide_show(self):
        o = create_service()
        self.assertEqual(Action.objects.count(), 1)
        o.published = False
        o.save()
        self.assertEqual(Action.objects.count(), 1)
        o.published = True
        o.save()
        self.assertEqual(Action.objects.count(), 2)

    def test_service_published_hide_show_new_instance(self):
        o = create_service()
        self.assertEqual(Action.objects.count(), 1)
        o.published = False
        o.save()
        self.assertEqual(Action.objects.count(), 1)
        o = Service.objects.last()
        o.published = True
        o.save()
        self.assertEqual(Action.objects.count(), 2)

    def test_service_published_edit(self):
        o = create_service()
        o.title = 'test_service_title_new'
        o.save()
        self.assertEqual(Action.objects.count(), 1)
