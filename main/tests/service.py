from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import authenticate
from .common import create_user, create_group, create_user_profile
from ..models import Service


class ServiceCreatePageTestCase(TestCase):
    def test_get_anonymous(self):
        response = Client().get(reverse('service_create'), {}, follow=True)
        self.assertEqual(response.request['PATH_INFO'], reverse('login'))

    def test_get_authenticated(self):
        client = Client()
        client.force_login(create_user_profile().user)
        response = client.get(reverse('service_create'))
        self.assertEqual(response.status_code, HttpResponse.status_code)

    def test_post_empty_authenticated(self):
        client = Client()
        client.force_login(create_user_profile().user)
        count = Service.objects.count()
        response = client.post(reverse('service_create'), {})
        self.assertEqual(count, Service.objects.count())
        self.assertEqual(response.status_code, HttpResponse.status_code)

    data_post = {
        'title': 'test_title',
        'description': 'test_description',
        'price': '10',
        'published': 'true'
    }
    data_valid = {
        'title': 'test_title',
        'description': 'test_description',
        'price': 10,
        'published': True
    }

    def check_attributes(self, obj, dic):
        for i in dic:
            if isinstance(dic[i], dict):
                self.check_attributes(getattr(obj, i), dic[i])
            else:
                self.assertEqual(getattr(obj, i), dic[i])

    def test_post_fields_all(self):
        client = Client()
        client.force_login(create_user_profile().user)
        response = client.post(reverse('service_create'), self.data_post, follow=True)
        obj = Service.objects.last()
        self.assertEqual(response.request['PATH_INFO'], reverse('service', args=[obj.pk]))
        self.check_attributes(obj, self.data_valid)

    def _test_post_fields(self, field_name, field_value='', valid=False):
        client = Client()
        client.force_login(create_user_profile().user)
        count = Service.objects.count()
        data = self.data_post.copy()
        if field_value:
            data[field_name] = field_value
        else:
            del data[field_name]
        response = client.post(reverse('service_create'), data)
        self.assertEqual(count + valid, Service.objects.count())
        self.assertEqual(response.status_code, HttpResponseRedirect.status_code if valid else HttpResponse.status_code)

    def test_post_fields_require(self):
        self._test_post_fields('title')
        self._test_post_fields('description', valid=True)
        self._test_post_fields('price', valid=True)
        self._test_post_fields('published', valid=True)
