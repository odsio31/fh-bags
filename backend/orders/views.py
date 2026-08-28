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
        return float(rate.price_domicile if type_livraison == 'domicile' else rate.price_bureau)
    except Exception:
        # Defaults if wilaya not found
        return 600 if type_livraison == 'domicile' else 370


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

        # Get wilaya-based shipping price
        frais = get_shipping_price(wilaya, type_liv)

        sous_total = 0
        resolved   = []
        for item in items:
            try:
                p = Product.objects.get(id=item['product_id'], is_available=True)
            except Product.DoesNotExist:
                return Response({'error': f"Produit #{item['product_id']} introuvable."}, status=404)
            sous_total += p.price * item['quantity']
            resolved.append((p, item['quantity'], item.get('color_name', ''), item.get('color_hex', '')))

        order = Order.objects.create(
            **data,
            frais_livraison=frais,
            sous_total=sous_total,
            total=sous_total + frais
        )
        for p, qty, cn, ch in resolved:
            OrderItem.objects.create(
                order=order, product=p,
                product_name=p.name, product_price=p.price,
                quantity=qty, color_name=cn, color_hex=ch
            )
            if not p.colors.exists():
                p.stock = max(0, p.stock - qty)
                p.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset           = Order.objects.all()
    serializer_class   = OrderSerializer
