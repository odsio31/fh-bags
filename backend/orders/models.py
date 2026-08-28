from django.db import models
from products.models import Product


class Order(models.Model):
    LIVRAISON_CHOICES = [
        ('domicile', 'Livraison a domicile (600 DA)'),
        ('bureau',   'Livraison en bureau Yallidine (370 DA)'),
    ]
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirme',   'Confirme'),
        ('expedie',    'Expedie'),
        ('livre',      'Livre'),
        ('annule',     'Annule'),
    ]

    prenom          = models.CharField(max_length=100)
    nom             = models.CharField(max_length=100)
    whatsapp        = models.CharField(max_length=20)
    pays            = models.CharField(max_length=100)
    wilaya          = models.CharField(max_length=100)
    commune         = models.CharField(max_length=100)
    adresse         = models.TextField()
    type_livraison  = models.CharField(max_length=20, choices=LIVRAISON_CHOICES, default='domicile')
    frais_livraison = models.DecimalField(max_digits=10, decimal_places=2, default=600)
    sous_total      = models.DecimalField(max_digits=10, decimal_places=2)
    total           = models.DecimalField(max_digits=10, decimal_places=2)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    notes           = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Commande #{self.id} — {self.prenom} {self.nom} ({self.get_status_display()})"


class OrderItem(models.Model):
    order         = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product       = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name  = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity      = models.PositiveIntegerField(default=1)
    color_name    = models.CharField(max_length=50, blank=True)
    color_hex     = models.CharField(max_length=7, blank=True)

    def __str__(self):
        color = f" ({self.color_name})" if self.color_name else ""
        return f"{self.quantity} x {self.product_name}{color}"

    @property
    def subtotal(self):
        return self.product_price * self.quantity
