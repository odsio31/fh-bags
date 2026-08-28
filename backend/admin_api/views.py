from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from orders.models import Order
from products.models import Product, Category, ProductImage, ProductColor
from products.serializers import ProductSerializer, CategorySerializer, ProductImageSerializer


# ── Login ─────────────────────────────────────────────────────────────────────
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password')
        )
        if user and user.is_staff:
            refresh = RefreshToken.for_user(user)
            return Response({'access': str(refresh.access_token), 'refresh': str(refresh), 'username': user.username})
        return Response({'error': 'Identifiants invalides.'}, status=401)


# ── Stats ─────────────────────────────────────────────────────────────────────
class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today  = timezone.now().date()
        orders = Order.objects.all()
        chart  = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            chart.append({
                'date': day.strftime('%d/%m'),
                'ca':   float(orders.filter(created_at__date=day).aggregate(s=Sum('total'))['s'] or 0),
                'nb':   orders.filter(created_at__date=day).count(),
            })
        last5 = [{
            'id': o.id, 'nom': f"{o.prenom} {o.nom}", 'whatsapp': o.whatsapp,
            'wilaya': o.wilaya, 'total': float(o.total),
            'type_livraison': o.type_livraison, 'status': o.status,
            'created_at': o.created_at.strftime('%d/%m/%Y %H:%M'),
        } for o in orders.order_by('-created_at')[:5]]
        return Response({
            'total_commandes': orders.count(),
            'ca_total': float(orders.aggregate(s=Sum('total'))['s'] or 0),
            'ca_jour':  float(orders.filter(created_at__date=today).aggregate(s=Sum('total'))['s'] or 0),
            'en_attente': orders.filter(status='en_attente').count(),
            'confirme':   orders.filter(status='confirme').count(),
            'expedie':    orders.filter(status='expedie').count(),
            'livre':      orders.filter(status='livre').count(),
            'annule':     orders.filter(status='annule').count(),
            'chart': chart, 'last5': last5,
        })


# ── Commandes ─────────────────────────────────────────────────────────────────
class AdminCommandesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Order.objects.all().order_by('-created_at')
        sf = request.query_params.get('status')
        sr = request.query_params.get('search')
        if sf: qs = qs.filter(status=sf)
        if sr: qs = qs.filter(nom__icontains=sr) | qs.filter(prenom__icontains=sr) | qs.filter(whatsapp__icontains=sr)
        return Response([{
            'id': o.id, 'prenom': o.prenom, 'nom': o.nom, 'whatsapp': o.whatsapp,
            'wilaya': o.wilaya, 'commune': o.commune, 'adresse': o.adresse, 'pays': o.pays,
            'total': float(o.total), 'sous_total': float(o.sous_total),
            'frais_livraison': float(o.frais_livraison),
            'type_livraison': o.type_livraison, 'status': o.status,
            'notes': o.notes, 'created_at': o.created_at.strftime('%d/%m/%Y %H:%M'),
            'items': [{'product_name': i.product_name, 'product_price': float(i.product_price),
                       'quantity': i.quantity, 'subtotal': float(i.subtotal),
                       'color_name': i.color_name, 'color_hex': i.color_hex,
                       } for i in o.items.all()],
        } for o in qs])


class AdminCommandeDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
        return Response({'success': True, 'status': order.status})

    def delete(self, request, pk):
        try:
            Order.objects.get(pk=pk).delete()
        except Order.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        return Response({'success': True}, status=204)


# ── Produits ──────────────────────────────────────────────────────────────────
class AdminProduitsView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        products = Product.objects.select_related('category').prefetch_related('images', 'colors').all()
        return Response(ProductSerializer(products, many=True, context={'request': request}).data)

    def post(self, request):
        data = request.data.copy()
        data['is_featured']  = str(data.get('is_featured', 'false')).lower() in ('true', '1', 'on')
        data['is_available'] = str(data.get('is_available', 'true')).lower() in ('true', '1', 'on')
        s = ProductSerializer(data=data, context={'request': request})
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminProduitDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        data = request.data.copy()
        if 'is_featured'  in data: data['is_featured']  = str(data['is_featured']).lower()  in ('true','1','on')
        if 'is_available' in data: data['is_available'] = str(data['is_available']).lower() in ('true','1','on')
        if 'image' not in request.FILES: data.pop('image', None)
        s = ProductSerializer(product, data=data, partial=True, context={'request': request})
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        try:
            Product.objects.get(pk=pk).delete()
        except Product.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        return Response({'success': True}, status=204)


# ── Product Images ────────────────────────────────────────────────────────────
class AdminProductImagesView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)
        images = product.images.all()
        return Response(ProductImageSerializer(images, many=True, context={'request': request}).data)

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Produit introuvable.'}, status=404)

        image_file = request.FILES.get('image')
        image_url  = request.data.get('image_url', '')
        is_main    = request.data.get('is_main', 'false').lower() in ('true', '1')
        order      = int(request.data.get('order', 0))

        img = ProductImage.objects.create(
            product=product,
            image=image_file if image_file else None,
            image_url=image_url,
            is_main=is_main,
            order=order,
        )
        # Auto first image = main
        if product.images.count() == 1:
            img.is_main = True
            img.save()

        return Response(ProductImageSerializer(img, context={'request': request}).data, status=201)


class AdminProductImageDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk, img_id):
        try:
            img = ProductImage.objects.get(pk=img_id, product_id=pk)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image introuvable.'}, status=404)
        is_main = request.data.get('is_main')
        if is_main is not None:
            img.is_main = str(is_main).lower() in ('true', '1')
            img.save()
        return Response(ProductImageSerializer(img, context={'request': request}).data)

    def delete(self, request, pk, img_id):
        try:
            img = ProductImage.objects.get(pk=img_id, product_id=pk)
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image introuvable.'}, status=404)
        was_main = img.is_main
        img.delete()
        # Auto-set next image as main
        if was_main:
            nxt = ProductImage.objects.filter(product_id=pk).first()
            if nxt:
                nxt.is_main = True
                nxt.save()
        return Response({'success': True}, status=204)


# ── Product Colors ────────────────────────────────────────────────────────────
class AdminProductColorsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        from products.serializers import ProductColorSerializer
        return Response(ProductColorSerializer(product.colors.all(), many=True).data)

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        from products.serializers import ProductColorSerializer
        s = ProductColorSerializer(data=request.data)
        if s.is_valid():
            s.save(product=product)
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminProductColorDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk, color_id):
        try:
            color = ProductColor.objects.get(pk=color_id, product_id=pk)
        except ProductColor.DoesNotExist:
            return Response({'error': 'Couleur introuvable.'}, status=404)
        from products.serializers import ProductColorSerializer
        s = ProductColorSerializer(color, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk, color_id):
        try:
            ProductColor.objects.get(pk=color_id, product_id=pk).delete()
        except ProductColor.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        return Response({'success': True}, status=204)


# ── Categories ────────────────────────────────────────────────────────────────
class AdminCategoriesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        cats = Category.objects.annotate(nb_produits=Count('products')).all()
        return Response([{'id': c.id, 'name': c.name, 'slug': c.slug,
                          'description': c.description, 'nb_produits': c.nb_produits} for c in cats])

    def post(self, request):
        s = CategorySerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminCategorieDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            cat = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        s = CategorySerializer(cat, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        try:
            Category.objects.get(pk=pk).delete()
        except Category.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        return Response({'success': True}, status=204)


# ── Shipping Rates Admin ──────────────────────────────────────────────────────
class AdminShippingRatesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from shipping.models import ShippingRate
        from shipping.serializers import ShippingRateSerializer
        rates = ShippingRate.objects.all().order_by('wilaya')
        return Response(ShippingRateSerializer(rates, many=True).data)

    def post(self, request):
        from shipping.models import ShippingRate
        from shipping.serializers import ShippingRateSerializer
        s = ShippingRateSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class AdminShippingRateDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        from shipping.models import ShippingRate
        from shipping.serializers import ShippingRateSerializer
        try:
            rate = ShippingRate.objects.get(pk=pk)
        except ShippingRate.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        s = ShippingRateSerializer(rate, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        from shipping.models import ShippingRate
        try:
            ShippingRate.objects.get(pk=pk).delete()
        except ShippingRate.DoesNotExist:
            return Response({'error': 'Introuvable.'}, status=404)
        return Response({'success': True}, status=204)
