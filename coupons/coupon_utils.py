import random
import string

def offer_coupon(length=8):
  return ''.join(random.choices(string.ascii_uppercase+string.digits,k=length))
