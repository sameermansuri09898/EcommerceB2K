from django.core.cache import cache
from functools import wraps
from rest_framework.response import Response


def cache_page_decorators(timeout):
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):

            if request.method != "GET":
                return func(self, request, *args, **kwargs)

            user_id = request.user.id if request.user.is_authenticated else "anonymous"

            cache_key = f"cache_page:{request.get_full_path()}:{user_id}"

            cached_response = cache.get(cache_key)

            if cached_response:
                return Response(cached_response)

            response = func(self, request, *args, **kwargs)

            if response.status_code == 200:
                cache.set(cache_key, response.data, timeout)

            return response

        return wrapper
    return decorator