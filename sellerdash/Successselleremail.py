from django.core.mail import send_mail
from django.conf import settings

def send_wellcome_email(email):
    subject = 'Congratulation Your seller account is verified'
    message = f'''
    <h1>Your seller account is verified</h1>
    <p>Thank you for registering with us</p>
    <p>now you can login in to your account</p>
    <p>Now You Can Add Products To Your Shop</p>
    <p>Thank you </p>
    '''
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    fail_silently=False
    send_mail(subject, message, email_from, recipient_list,fail_silently=fail_silently)