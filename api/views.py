from django.http.request import HttpRequest
from django.http.response import HttpResponse, JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from voting.models import Vote
from voting.views import xmlhttprequest_vote_on_object
from .decorators import api_login_required
from .registry import registry
from .utils import *


VOTE_DIRECTIONS = dict(up='up', down='down', clear='clear')

def get_vote(request: HttpRequest, action: str, id: str) -> JsonResponse:
    if request.method != "GET":
        return json_error_response("This method accepts only GET requests.")

    cls = registry.get(action)
    if cls is None:
        return json_error_response("Specified method hasn't been found.")

    lookup = { "%s__exact" % cls._meta.pk.name: id }
    try:
        model = cls._default_manager.get(**lookup)
    except ObjectDoesNotExist:
        return json_error_response("No %s was found for %s." % (cls._meta.verbose_name, int(id)))

    score = Vote.objects.get_score(model).update(dict(success=True))
    return json_response(**score)


@api_login_required
def post_vote(request: HttpRequest, action: str, id: str, direction: str) -> HttpResponse:
    model_cls = registry.get(action)
    return xmlhttprequest_vote_on_object(request, model_cls, VOTE_DIRECTIONS[direction], int(id))

