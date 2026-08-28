from django.db import models


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category     = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name         = models.CharField(max_length=200)
    slug         = models.SlugField(max_length=200, unique=True)
    description  = models.TextField()
    price        = models.DecimalField(max_digits=10, decimal_places=2)
    image        = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url    = models.URLField(blank=True)
    stock        = models.PositiveIntegerField(default=0)
    is_featured  = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        colors = self.colors.all()
        if colors.exists():
            return any(c.stock > 0 for c in colors)
        return self.stock > 0


class ProductImage(models.Model):
    product   = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image     = models.ImageField(upload_to='products/gallery/', blank=True, null=True)
    image_url = models.URLField(blank=True)
    order     = models.PositiveIntegerField(default=0)
    is_main   = models.BooleanField(default=False)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image #{self.id} — {self.product.name}"

    def save(self, *args, **kwargs):
        if self.is_main:
            ProductImage.objects.filter(
                product=self.product, is_main=True
            ).exclude(pk=self.pk).update(is_main=False)
        super().save(*args, **kwargs)
        # Auto-set first image as main if none is
        if not ProductImage.objects.filter(product=self.product, is_main=True).exists():
            first = ProductImage.objects.filter(product=self.product).first()
            if first:
                ProductImage.objects.filter(pk=first.pk).update(is_main=True)


class ProductColor(models.Model):
    product  = models.ForeignKey(Product, related_name='colors', on_delete=models.CASCADE)
    name     = models.CharField(max_length=50)
    hex_code = models.CharField(max_length=7, default='#C19A6B')
    stock    = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name} — {self.product.name}"
