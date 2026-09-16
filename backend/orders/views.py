from decimal import Decimal
from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Order, OrderItem
from .serializers import CreateOrderSerializer, OrderSerializer
from products.models import Product


def get_shipping_price(wilaya, type_livraison):
    """Get shipping price for a wilaya. Fallback to defaults if not found."""
    try:
        from shipping.models import ShippingRate
        rate = ShippingRate.objects.get(wilaya=wilaya, is_active=True)
        price = rate.price_domicile if type_livraison == 'domicile' else rate.price_bureau
        return Decimal(str(price))
    except Exception:
        # Defaults if wilaya not found (Use Decimal to avoid float/Decimal crash)
        return Decimal('600.00') if type_livraison == 'domicile' else Decimal('370.00')


class OrderCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = CreateOrderSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

        data     = s.validated_data
        items    = data.pop('items')
        wilaya   = data.get('wilaya', '')
        type_liv = data['type_livraison']

        # Get wilaya-based shipping price as Decimal
        frais = get_shipping_price(wilaya, type_liv)

        sous_total = Decimal('0.00')
        resolved   = []
        
        for item in items:
            try:
                p = Product.objects.get(id=item['product_id'], is_available=True)
            except Product.DoesNotExist:
                return Response({'error': f"Produit #{item['product_id']} introuvable."}, status=status.HTTP_404_NOT_FOUND)
            
            # Ensure p.price is Decimal
            price = Decimal(str(p.price))
            sous_total += price * item['quantity']
            resolved.append((p, item['quantity'], item.get('color_name', ''), item.get('color_hex', '')))

        try:
            with transaction.atomic():
                order = Order.objects.create(
                    **data,
                    frais_livraison=frais,
                    sous_total=sous_total,
                    total=sous_total + frais
                )
                
                for p, qty, cn, ch in resolved:
                    OrderItem.objects.create(
                        order=order, 
                        product=p,
                        product_name=p.name, 
                        product_price=p.price,
                        quantity=qty, 
                        color_name=cn, 
                        color_hex=ch
                    )
                    
                    if hasattr(p, 'colors') and not p.colors.exists():
                        p.stock = max(0, p.stock - qty)
                        p.save()

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Handle database creation error
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset           = Order.objects.all()
    serializer_class   = OrderSerializer