from django import template
from django.utils.translation import ugettext as _

register = template.Library()


@register.inclusion_tag('main/common/coins.html')
def coins(_coins):
    return {
        'int': _coins.is_integer(),
        'coins': int(_coins) if _coins.is_integer() else _coins
    }


@register.inclusion_tag('main/common/user.html')
def user(user_profile):
    return {'userprofile': user_profile}


@register.inclusion_tag('main/common/status.html')
def status(_status):
    if _status.pk == 1:
        icon = 'question-sign'
    elif _status.pk == 2:
        icon = 'ok-sign'
    else:
        icon = 'info-sign'

    if _status.pk == 1:
        color = 'warning'
    elif _status.pk == 2:
        color = 'success'
    elif _status.pk == 3:
        color = 'danger'
    elif _status.pk == 4:
        color = 'info'
    else:
        color = 'info'

    return {'status': _status, 'icon': icon, 'color': color}


def context_processor(request):
    return {
        'site_name': _('WitCoin'),
    }
