from django.contrib.auth.models import User
from main.models import UserProfile, Group, Task, TaskUser, Transaction, Service


def create_group(name='group_name_test'):
    group = Group(**locals())
    group.save()
    return group

user_counter = 0


def create_user(username=None, password='user_password_test',
                first_name='user_first_name_test', last_name='user_last_name_test', email=None):
    if not username or not email:
        global user_counter
        user_counter += 1
        username = 'user_username_test_' + str(user_counter) if not username else username
        email = 'user@email.test' + str(user_counter) if not email else email
    user = User(**locals())
    user.set_password(password)
    user.save()
    return user


def create_user_profile(about='user_profile_about_test', group=None, user=None):
    group = group or create_group()
    user = user or create_user()
    user_profile = UserProfile(**locals())
    user_profile.save()
    return user_profile


def create_task(author=None, title='task_title_test', description='task_description_test', status=True):
    author = author or create_user_profile()
    task = Task(**locals())
    task.save()
    return task


def create_task_user(user=None, task=None, description='task_user_description_test', price=10):
    task = task or create_task()
    user = user or create_user_profile()
    task_user = TaskUser(**locals())
    task_user.save()
    return task_user


def create_transaction(user_from=None, user_to=None, description='transaction_description_test', status=True, amount=10):
    user_from = user_from or create_user_profile()
    user_to = user_to or create_user_profile()
    transaction = Transaction(**locals())
    transaction.save()
    return transaction


def create_service(author=None, title='service_title_test', description='service_description_test', price=10,
                   published=True):
    author = author or create_user_profile()
    service = Service(**locals())
    service.save()
    return service
