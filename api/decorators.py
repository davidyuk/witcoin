from functools import wraps
from django.http import HttpRequest, HttpResponse
from .utils import *


def api_login_required(function, message="User must be logged in to use this API method."):

    @wraps(function)
    def _login_wrapper(request: HttpRequest, *args, **kwargs) -> HttpResponse:
        if request.user.is_authenticated():
            return function(request, *args, **kwargs)
        return json_error_response(message)

    return _login_wrapper