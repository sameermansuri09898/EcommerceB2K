from rest_framework.views import APIView
from .models import Wishlist
from .whislist_serializer import WishlistSerializer ,WhishlistViewSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from rest_framework_simplejwt.authentication import JWTAuthentication

class WishlistViewSet(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            wishlist_items = (
                Wishlist.objects
                .filter(user=request.user)
                .select_related(
                    'product_item',
                    'product_varient',
                    'product_varient__colors',
                    'product_varient__sizes'
                )
            )

            serializer = WhishlistViewSerializer(
                wishlist_items,
                many=True
            )

            return Response(serializer.data)

        except Exception as e:
            print("WISHLIST ERROR:", e)
            return Response(
                {"error": str(e)},
                status=500
            )      
class add_to_wishlist(APIView):
    permission_classes = [IsAuthenticated]  
    authentication_classes = [JWTAuthentication]   
    def post(self, request):
        try:
            product_id = request.data.get('product_id')
            variant_id = request.data.get('variant_id')
            user = request.user
            wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            product_item_id=product_id,  
            # product_item_id se django sirf id fetch karega, aur product_varient_id se variant ki id fetch karegana ki wo foreign key hai, aur usme se id fetch karna hai, isliye humne product_item_id aur all object ko fetch karne ke bajaye sirf id ko fetch karne ke liye _id lagaya hai, isse performance bhi improve hoti hai kyunki django ko sirf id fetch karna hota hai, aur database query bhi optimize hoti hai, aur product_varient_id se variant ki id fetch karega, aur usme se id fetch karna hai, isliye humne product_varient_id lagaya hai, isse performance bhi improve hoti hai kyunki django ko sirf id fetch karna hota hai, aur database query bhi optimize hoti hai,
            product_varient_id=variant_id
            )
            if created:
                return Response({"message": "Item added to wishlist"}, status=201)
            else:
                return Response({"message": "Item already in wishlist"}, status=200)
        except ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=401)
        except InvalidTokenError:
            return Response({"error": "Invalid token"}, status=401)

class remove_from_wishlist(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def delete(self, request):
        try:
            product_id = request.data.get('product_id')
            variant_id = request.data.get('variant_id')
            user = request.user
            wishlist_item = Wishlist.objects.filter(
                user=user,
                product_item_id=product_id,
                product_varient_id=variant_id
            ).first()
            if wishlist_item:
                wishlist_item.delete()
                return Response({"message": "Item removed from wishlist"}, status=200)
            else:
                return Response({"message": "Item not found in wishlist"}, status=404)
        except ExpiredSignatureError:
            return Response({"error": "Token has expired"}, status=401)
        except InvalidTokenError:
            return Response({"error": "Invalid token"}, status=401)    