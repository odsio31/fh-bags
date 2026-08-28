from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category
from .serializers import ProductSerializer, ProductListSerializer, CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (Product.objects
        .filter(is_available=True)
        .select_related('category')
        .prefetch_related('images', 'colors'))
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured']
    search_fields    = ['name', 'description', 'category__name']
    ordering_fields  = ['price', 'created_at', 'name']
    ordering         = ['-created_at']
    lookup_field     = 'slug'

    def get_serializer_class(self):
        return ProductListSerializer if self.action == 'list' else ProductSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:8]
        return Response(ProductListSerializer(qs, many=True, context={'request': request}).data)
