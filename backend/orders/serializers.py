from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    product_id  = serializers.IntegerField()
    quantity    = serializers.IntegerField(min_value=1)
    color_name  = serializers.CharField(required=False, allow_blank=True, default='')
    color_hex   = serializers.CharField(required=False, allow_blank=True, default='')


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price',
                  'quantity', 'subtotal', 'color_name', 'color_hex']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'prenom', 'nom', 'whatsapp',
            'pays', 'wilaya', 'commune', 'adresse',
            'type_livraison', 'frais_livraison',
            'sous_total', 'total', 'status', 'notes',
            'items', 'created_at',
        ]
        read_only_fields = ['frais_livraison', 'sous_total', 'total', 'status', 'created_at']


class CreateOrderSerializer(serializers.Serializer):
    prenom         = serializers.CharField(max_length=100)
    nom            = serializers.CharField(max_length=100)
    whatsapp       = serializers.CharField(max_length=20)
    pays           = serializers.CharField(max_length=100)
    wilaya         = serializers.CharField(max_length=100)
    commune        = serializers.CharField(max_length=100)
    adresse        = serializers.CharField()
    type_livraison = serializers.ChoiceField(choices=['domicile', 'bureau'])
    notes          = serializers.CharField(required=False, allow_blank=True, default='')
    items          = OrderItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Le panier est vide.")
        return value
