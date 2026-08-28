from django.urls import path
from .views import (
    AdminLoginView, AdminStatsView,
    AdminCommandesView, AdminCommandeDetailView,
    AdminProduitsView, AdminProduitDetailView,
    AdminProductImagesView, AdminProductImageDetailView,
    AdminProductColorsView, AdminProductColorDetailView,
    AdminCategoriesView, AdminCategorieDetailView,
    AdminShippingRatesView, AdminShippingRateDetailView,
)

urlpatterns = [
    path('login/',               AdminLoginView.as_view()),
    path('stats/',               AdminStatsView.as_view()),
    path('commandes/',           AdminCommandesView.as_view()),
    path('commandes/<int:pk>/',  AdminCommandeDetailView.as_view()),
    path('produits/',            AdminProduitsView.as_view()),
    path('produits/<int:pk>/',   AdminProduitDetailView.as_view()),
    path('produits/<int:pk>/images/',              AdminProductImagesView.as_view()),
    path('produits/<int:pk>/images/<int:img_id>/', AdminProductImageDetailView.as_view()),
    path('produits/<int:pk>/colors/',                  AdminProductColorsView.as_view()),
    path('produits/<int:pk>/colors/<int:color_id>/',   AdminProductColorDetailView.as_view()),
    path('categories/',            AdminCategoriesView.as_view()),
    path('categories/<int:pk>/',   AdminCategorieDetailView.as_view()),
    path('shipping/',              AdminShippingRatesView.as_view()),
    path('shipping/<int:pk>/',     AdminShippingRateDetailView.as_view()),
]
