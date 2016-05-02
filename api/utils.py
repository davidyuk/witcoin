from django.http.response import JsonResponse


def json_response(**kwargs) -> JsonResponse:
    return JsonResponse(kwargs)


def json_error_response(message: str) -> JsonResponse:
    return json_response(success=False, error=message)
