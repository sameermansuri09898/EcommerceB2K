import random
import string

def offer_coupon(length=8):
  return ''.join(random.choice(string.ascii_uppercase+string.digits,k=length))

offer_coupon()