from rest_framework import serializers
from .models import SellerProfile

class sellerserializer(serializers.ModelSerializer):
  class Meta:
    model=SellerProfile
    fields='__all__'
    extra_kwargs={'user,is_verified,bank_account_holder_name,bank_account_number,bank_ifsc_code,bank_name,bank_branch,bank_account_holder_name,pan_number,gst_number,aadhaar_number,shop_phone': {'read_only': True}}


  def validate(self,attrs):
    bank_account=attrs.get('bank_account_number')
    bank_ifsc_code=attrs.get('bank_ifsc_code')
    bank_name=attrs.get('bank_name')
    bank_branch=attrs.get('bank_branch')
    bank_account_holder_name=attrs.get('bank_account_holder_name')
    pan=attrs.get('pan_number')
    gst=attrs.get('gst_number')
    aadhaar=attrs.get('aadhaar_number')
    shop_phone=attrs.get('shop_phone')


    if not bank_account or not bank_ifsc_code or not bank_name or not bank_branch or not bank_account_holder_name:
      raise serializers.ValidationError("Bank Account Details are Required")

      if not bank_account.isdigit():
        raise serializers.ValidationError("Bank Account Number Must Be in Numbers")

      if not bank_ifsc_code.isalnum():
        raise serializers.ValidationError("Bank IFSC Code Must Be Alphanumeric")    

      if not bank_name.isalpha():
        raise serializers.ValidationError("Bank Name Must Be In Alphabets")    

      if not bank_branch.isalpha():
        raise serializers.ValidationError("Bank Branch Must Be In Alphabets")    

      if not bank_account_holder_name.isalpha():
        raise serializers.ValidationError("Bank Account Holder Name Must Be In Alphabets")    


      if not pan or not gst or not aadhaar or not shop_phone:
        raise serializers.ValidationError("Pan, GST, Aadhaar and Shop Phone are Required")

      if not pan.isalnum():
        raise serializers.ValidationError("Pan Number Must Be Alphanumeric")    

      if not gst.isalnum():
        raise serializers.ValidationError("GST Number Must Be Alphanumeric")    

      if not aadhaar.isdigit():
        raise serializers.ValidationError("Aadhaar Number Must Be In Numbers")    

      if not shop_phone.isdigit():
        raise serializers.ValidationError("Shop Phone Number Must Be In Numbers")  


    return attrs      

  

  def validate_email(self,value):
    email=value
    if not value:
      raise serializers.ValidationError("Email is Required")

    if SellerProfile.objects.filter(email=email).exists():
      raise serializers.ValidationError("Seller Email is Already Exits")

  def create(self,validated_data):
    seller=SellerProfile.objects.create(**validated_data)
    return seller

  

    