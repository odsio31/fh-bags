from rest_framework import serializers
from .models import Product, Category, ProductImage, ProductColor


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ['id', 'image', 'image_url', 'url', 'order', 'is_main']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            try:
                raw = obj.image.url        # e.g. /media/products/gallery/xxx.jpg
                if request:
                    return request.build_absolute_uri(raw)
                return 'http://localhost:8000' + raw
            except Exception:
                pass
        return obj.image_url or ''


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ProductColor
        fields = ['id', 'name', 'hex_code', 'stock']


def resolve_main_image(product, request=None):
    """Return the best absolute image URL for a product.

    product.image (the "Photo principale" field) is authoritative when set;
    the images gallery is only a fallback for products with no main photo.
    """
    if product.image:
        try:
            raw = product.image.url
            return request.build_absolute_uri(raw) if request else 'http://localhost:8000' + raw
        except Exception:
            pass
    try:
        images = list(product.images.all())
        if images:
            main = next((i for i in images if i.is_main), images[0])
            if main.image:
                try:
                    raw = main.image.url
                    return request.build_absolute_uri(raw) if request else 'http://localhost:8000' + raw
                except Exception:
                    pass
            if main.image_url:
                return main.image_url
    except Exception:
        pass
    return product.image_url or ''


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    in_stock      = serializers.ReadOnlyField()
    main_image    = serializers.SerializerMethodField()
    colors        = ProductColorSerializer(many=True, read_only=True)

    class Meta:
        model  = Product
        fields = ['id', 'name', 'slug', 'price', 'image', 'image_url',
                  'main_image', 'in_stock', 'is_featured', 'category_name', 'colors']

    def get_main_image(self, obj):
        return resolve_main_image(obj, self.context.get('request'))


class ProductSerializer(serializers.ModelSerializer):
    category    = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category',
        write_only=True, required=False, allow_null=True)
    images     = ProductImageSerializer(many=True, read_only=True)
    colors     = ProductColorSerializer(many=True, read_only=True)
    in_stock   = serializers.ReadOnlyField()
    main_image = serializers.SerializerMethodField()

    class Meta:
        model  = Product
        fields = ['id', 'name', 'slug', 'description', 'price',
                  'image', 'image_url', 'main_image', 'in_stock', 'stock',
                  'is_featured', 'is_available', 'category', 'category_id',
                  'images', 'colors', 'created_at', 'updated_at']

    def get_main_image(self, obj):
        return resolve_main_image(obj, self.context.get('request'))
