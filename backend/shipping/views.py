from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ShippingRate
from .serializers import ShippingRateSerializer


class ShippingRatesPublicView(APIView):
    """Public endpoint — frontend uses this to show prices per wilaya."""
    permission_classes = [AllowAny]

    def get(self, request):
        rates = ShippingRate.objects.filter(is_active=True)
        return Response(ShippingRateSerializer(rates, many=True).data)
