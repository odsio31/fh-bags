from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'quantity', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ['id', 'prenom', 'nom', 'whatsapp', 'wilaya', 'type_livraison', 'total', 'status', 'created_at']
    list_filter   = ['status', 'type_livraison', 'wilaya', 'created_at']
    list_editable = ['status']
    search_fields = ['prenom', 'nom', 'whatsapp', 'wilaya']
    inlines       = [OrderItemInline]
    readonly_fields = ['sous_total', 'frais_livraison', 'total', 'created_at']
