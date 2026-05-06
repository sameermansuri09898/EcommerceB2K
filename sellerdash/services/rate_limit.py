import redis
from rest_framework.response import Response
from rest_framework.status import HTTP_429_TOO_MANY_REQUESTS

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def rate_limit(max_requests: int, window_time: int):
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):

            client_ip = request.META.get("REMOTE_ADDR", "127.0.0.1")
            client_id = request.user.id if request.user.is_authenticated else client_ip

            key = f"rate_limit:{request.path}:{client_id}"
            current_requests = r.get(key)

            if current_requests is None:
                r.set(key, 1, ex=window_time)
            elif int(current_requests) < max_requests:
                r.incr(key)
            else:
                return Response(
                    {"error": "Too many requests"},
                    status=HTTP_429_TOO_MANY_REQUESTS
                )

            return func(self, request, *args, **kwargs)

        return wrapper
    return decorator

