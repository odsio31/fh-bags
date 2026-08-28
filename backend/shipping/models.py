from django.db import models


class ShippingRate(models.Model):
    wilaya           = models.CharField(max_length=100, unique=True)
    price_domicile   = models.DecimalField(max_digits=8, decimal_places=2, default=600)
    price_bureau     = models.DecimalField(max_digits=8, decimal_places=2, default=370)
    is_active        = models.BooleanField(default=True)

    class Meta:
        ordering = ['wilaya']
        verbose_name = 'Tarif Livraison'
        verbose_name_plural = 'Tarifs Livraison'

    def __str__(self):
        return f"{self.wilaya} — Domicile: {self.price_domicile} DA / Bureau: {self.price_bureau} DA"
