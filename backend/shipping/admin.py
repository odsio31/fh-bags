from django.contrib import admin
from .models import ShippingRate

@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display  = ['wilaya', 'price_domicile', 'price_bureau', 'is_active']
    list_editable = ['price_domicile', 'price_bureau', 'is_active']
    search_fields = ['wilaya']
    ordering      = ['wilaya']
