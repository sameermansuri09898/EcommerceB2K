import redis
from rest_framework.response import Response
from rest_framework.status import HTTP_429_TOO_MANY_REQUESTS

r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def rate_limit(Max_request : int , Winddw_time : int):
  """Rate limit decorator for API views
  
  Args:
      max_requests (int): Maximum number of requests allowed per window
      window_time (int): Time window in seconds
  """
  def decorator(func):
    def wrapper(self,request,*args,**kwargs):
      client_id=request.user.id if request.user.is_authenticated else request.META.get("REMOTE_ADDR")
      end_point=request.path
      
      key = f"rate_limit:{end_point}:{client_id}"
      current_requests=r.get(key)
      
      if current_requests is None:
        r.set(key, 1, ex=Winddw_time)
        return func(self,request,*args,**kwargs)
      else:
        r.set(key, int(current_requests) + 1, ex=Winddw_time)
        return func(self,request,*args,**kwargs)

    return wrapper

  return decorator      
      


