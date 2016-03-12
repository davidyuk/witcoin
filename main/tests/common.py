from django.contrib.auth.models import User
from main.models import UserProfile, Group


def create_group(name='group_name_test'):
    group = Group(**locals())
    group.save()
    return group

user_counter = 0


def create_user(username=None, password='user_password_test',
                first_name='user_first_name_test', last_name='user_last_name_test', email='user@email.test'):
    if not username:
        global user_counter
        user_counter += 1
        username = 'user_username_test_' + str(user_counter)
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
