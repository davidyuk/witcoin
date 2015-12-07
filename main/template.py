from django import template
from django.utils.translation import ugettext as _

register = template.Library()


@register.inclusion_tag('main/common/coins.html')
def coins(_coins):
    return {
        'int': _coins % 1 == 0,
        'coins': int(_coins) if _coins % 1 == 0 else _coins
    }


@register.inclusion_tag('main/common/user.html')
def user(user_profile):
    return {'userprofile': user_profile}


@register.inclusion_tag('main/common/status.html')
def status(_status, display_text=False):
    if _status is None:
        icon = 'question-sign'
        color = 'warning'
        title = 'Ожидание'
    elif _status:
        icon = 'ok-sign'
        color = 'success'
        title = 'Передано'
    else:
        icon = 'info-sign'
        color = 'info'
        title = 'Отменено'

    return {'status': _status, 'icon': icon, 'color': color, 'title': title, 'display_text': display_text}


def context_processor(request):
    return {
        'site_name': _('WitCoin'),
    }
