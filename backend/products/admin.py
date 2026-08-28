from django.contrib import admin
from .models import Product, Category, ProductImage, ProductColor

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display    = ['name', 'category', 'price', 'stock', 'is_featured', 'is_available']
    list_filter     = ['category', 'is_featured', 'is_available']
    list_editable   = ['price', 'stock', 'is_featured', 'is_available']
    search_fields   = ['name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductColorInline]
