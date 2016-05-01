from django.db.models import Model
from django import template
from ..registry import reverse

register = template.Library()


@register.simple_tag
def api_action(model):
    return str(reverse(model))

@register.simple_tag
def api_id(model: Model) -> int:
    if isinstance(model, Model):
        return model.id;
    return -1;