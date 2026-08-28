from django.urls import path
from .views import ShippingRatesPublicView

urlpatterns = [
    path('', ShippingRatesPublicView.as_view(), name='shipping-rates'),
]
