from django.core.cache import cache
from functools import wraps

def cache_page_decorators(timeout):
  def decorator(func):
    @wraps(func)

    def wrapper(self,request,*args,**kwargs):

      if request.method != "GET":
        return func(self,request,*args,**kwargs)
        
      chache_key=f"chache_page:{request.get_full_path()}"

      chached=cache.get(chache_key)

      if chached is not None:
        return chached
      
      reponse = func(self,request,*args,**kwargs)

      cache.set(chache_key,reponse,timeout)

      return reponse

    return wrapper

  return decorator      