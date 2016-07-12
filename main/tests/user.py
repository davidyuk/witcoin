from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import authenticate
from .common import create_user, create_group, create_user_profile


class RegisterPageTestCase(TestCase):
    def test_get(self):
        response = Client().get(reverse('register'))
        self.assertEqual(response.status_code, HttpResponse.status_code)

    def test_post_empty(self):
        users_count = User.objects.count()
        response = Client().post(reverse('register'), {})
        self.assertEqual(users_count, User.objects.count())
        self.assertEqual(response.status_code, HttpResponse.status_code)

    data_post_valid = {
        'username': 'test_username',
        'first_name': 'test_first_name',
        'last_name': 'test_last_name',
        'email': 'test@test.ru',
        'password1': 'Ab26e9rv',
        'password2': 'Ab26e9rv',
        'about': 'test_about',
        'group': 1,
        'captcha_0': 'PASSED',
        'captcha_1': 'PASSED',
    }
    data_user_valid = {
        'username': 'test_username',
        'first_name': 'test_first_name',
        'last_name': 'test_last_name',
        'email': 'test@test.ru',
        'userprofile': {
            'about': 'test_about',
            'group': {
                'pk': 1
            }
        }
    }

    def check_attributes(self, obj, dic):
        for i in dic:
            if isinstance(dic[i], dict):
                self.check_attributes(getattr(obj, i), dic[i])
            else:
                self.assertEqual(getattr(obj, i), dic[i])

    def test_post_fields_all(self):
        create_group()
        response = Client().post(reverse('register'), self.data_post_valid)
        self.assertEqual(response.status_code, HttpResponseRedirect.status_code)
        user = User.objects.get(username=self.data_post_valid['username'])
        self.check_attributes(user, self.data_user_valid)
        self.assertEqual(user, authenticate(username=self.data_post_valid['username'],
                                            password=self.data_post_valid['password1']))

    def _test_post_fields(self, field_name, field_value='', valid=False):
        users_count = User.objects.count()
        data = self.data_post_valid.copy()
        if field_value:
            data[field_name] = field_value
        else:
            del data[field_name]
        response = Client().post(reverse('register'), data)
        self.assertEqual(users_count + valid, User.objects.count())
        self.assertEqual(response.status_code, HttpResponseRedirect.status_code if valid else HttpResponse.status_code)

    def test_post_fields_require(self):
        self.data_post_valid['group'] = create_group().pk
        self._test_post_fields('username')
        self._test_post_fields('username', 'AzАя日本_.@+-123', True)
        self._test_post_fields('first_name')
        self._test_post_fields('last_name')
        self._test_post_fields('email')
        self._test_post_fields('email', 'test', False)
        self._test_post_fields('about', valid=True)
        self._test_post_fields('group')


class LoginPageTestCase(TestCase):
    data = {
        'username': 'test',
        'password': 'pass',
    }

    def test_get(self):
        response = Client().get(reverse('login'))
        self.assertEqual(response.status_code, HttpResponse.status_code)

    def test_post_empty(self):
        response = Client().post(reverse('login'), {}, follow=True)
        self.assertFalse(response.wsgi_request.user.is_authenticated())

    def test_post_fields_all(self):
        user = create_user(**self.data)
        response = Client().post(reverse('login'), self.data, follow=True)
        self.assertEqual(response.wsgi_request.user, user)

    def _test_post_fields(self, field_name, field_value='', valid=False):
        data = self.data.copy()
        if field_value:
            data[field_name] = field_value
        else:
            del data[field_name]
        user = valid and create_user(**data)
        response = Client().post(reverse('login'), data, follow=True)
        if valid:
            self.assertEqual(response.wsgi_request.user, user)
        else:
            self.assertFalse(response.wsgi_request.user.is_authenticated())

    def test_post_fields_require(self):
        self._test_post_fields('username')
        self._test_post_fields('password')
        self._test_post_fields('username', 'AzАя日本_.@+-123', True)


class UserPageTestCase(TestCase):
    def test_get_simple(self):
        create_user_profile(user=create_user('test'))
        response = Client().get(reverse('user', args=['test']))
        self.assertEqual(response.status_code, HttpResponse.status_code)

    def test_get(self):
        create_user_profile(user=create_user('AzАя日本_.@+-123'))
        response = Client().get(reverse('user', args=['AzАя日本_.@+-123']))
        self.assertEqual(response.status_code, HttpResponse.status_code)
