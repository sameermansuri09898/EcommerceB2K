import random
import string

def offer_coupon(length=8):
  return ''.join(random.choices("SAVE"+string.ascii_uppercase+string.digits,k=length))

print(offer_coupon())