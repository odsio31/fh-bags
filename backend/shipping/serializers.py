from rest_framework import serializers
from .models import ShippingRate


class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ShippingRate
        fields = ['id', 'wilaya', 'price_domicile', 'price_bureau', 'is_active']
