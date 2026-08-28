#!/usr/bin/env python
"""
Run: python seed_data.py  (depuis backend/, venv active)
Charge les produits + categories + tarifs de livraison.
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from products.models import Category, Product, ProductImage, ProductColor
from shipping.models import ShippingRate

print("=== Produits & Categories ===")
cats = [
    {'name':'Sacs Tote',       'slug':'tote-bags',      'description':'Grands sacs spacieux et elegants.'},
    {'name':'Pochettes',       'slug':'clutch-bags',    'description':'Pochettes elegantes pour soiree.'},
    {'name':'Sacs Bandouliere','slug':'crossbody-bags', 'description':'Sacs bandouliere pratiques et chics.'},
    {'name':'Sacs a Dos',      'slug':'backpacks',      'description':'Sacs a dos en cuir de luxe.'},
]
cat_objs = {}
for c in cats:
    obj, created = Category.objects.get_or_create(slug=c['slug'], defaults=c)
    cat_objs[c['slug']] = obj
    print(f"  {'✅' if created else '⚡'} {obj.name}")

products = [
    {'name':'Sahara Tote','slug':'sahara-tote','description':'Un grand sac tote en cuir camel avec quincaillerie doree. Parfait pour le travail ou les escapades.','price':12500,'stock':15,'is_featured':True,'category':cat_objs['tote-bags'],'image_url':'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80','colors':[('Camel','#C19A6B',8),('Noir','#1C1C1C',7)]},
    {'name':'Pochette Dusk','slug':'dusk-clutch','description':'Pochette de soiree raffinee en daim cognac avec chaine doree amovible.','price':8500,'stock':20,'is_featured':True,'category':cat_objs['clutch-bags'],'image_url':'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80','colors':[('Cognac','#9A4A2A',10),('Nude','#D4A574',10)]},
    {'name':'Nomad Bandouliere','slug':'nomad-crossbody','description':'Sac bandouliere leger en cuir lisse avec sangle reglable et poche zippee.','price':9800,'stock':12,'is_featured':True,'category':cat_objs['crossbody-bags'],'image_url':'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80','colors':[('Camel','#C19A6B',6),('Marron','#6B3A2A',6)]},
    {'name':'Marrakech Tote','slug':'marrakech-tote','description':'Inspire de l\'artisanat marocain, cuir tresse avec silhouette structuree.','price':14900,'stock':8,'is_featured':True,'category':cat_objs['tote-bags'],'image_url':'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80','colors':[('Beige','#D4B896',4),('Brun','#8B5E3C',4)]},
    {'name':'Sac a Dos Petal','slug':'petal-backpack','description':'Sac a dos feminin en cuir pebble avec compartiment laptop et plusieurs poches.','price':16800,'stock':10,'is_featured':False,'category':cat_objs['backpacks'],'image_url':'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80','colors':[('Rose','#E8B4A0',5),('Camel','#C19A6B',5)]},
    {'name':'Mini Pochette Amber','slug':'amber-mini-clutch','description':'Petite pochette en cuir ambre avec fermeture magnetique. Compacte et chic.','price':6200,'stock':25,'is_featured':False,'category':cat_objs['clutch-bags'],'image_url':'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80','colors':[('Ambre','#D4952A',12),('Cognac','#9A4A2A',13)]},
]

for p in products:
    colors = p.pop('colors', [])
    obj, created = Product.objects.get_or_create(slug=p['slug'], defaults=p)
    print(f"  {'✅' if created else '⚡'} {obj.name} — {obj.price} DA")
    if created:
        ProductImage.objects.create(product=obj, image_url=obj.image_url, is_main=True, order=0)
        for name, hex_code, stock in colors:
            ProductColor.objects.create(product=obj, name=name, hex_code=hex_code, stock=stock)

print("\n=== Tarifs de Livraison (58 wilayas) ===")
WILAYAS = [
    ("Adrar",700,450),("Chlef",600,370),("Laghouat",650,400),("Oum El Bouaghi",600,370),
    ("Batna",600,370),("Bejaia",600,370),("Biskra",650,400),("Bechar",700,450),
    ("Blida",500,320),("Bouira",550,350),("Tamanrasset",800,550),("Tebessa",650,400),
    ("Tlemcen",650,400),("Tiaret",600,370),("Tizi Ouzou",550,350),("Alger",500,320),
    ("Djelfa",600,370),("Jijel",600,370),("Setif",600,370),("Saida",600,370),
    ("Skikda",600,370),("Sidi Bel Abbes",650,400),("Annaba",600,370),("Guelma",600,370),
    ("Constantine",600,370),("Medea",550,350),("Mostaganem",600,370),("MSila",600,370),
    ("Mascara",600,370),("Ouargla",700,450),("Oran",600,370),("El Bayadh",700,450),
    ("Illizi",900,650),("Bordj Bou Arreridj",600,370),("Boumerdes",500,320),("El Tarf",600,370),
    ("Tindouf",900,650),("Tissemsilt",600,370),("El Oued",700,450),("Khenchela",650,400),
    ("Souk Ahras",650,400),("Tipaza",500,320),("Mila",600,370),("Ain Defla",550,350),
    ("Naama",700,450),("Ain Temouchent",650,400),("Ghardaia",700,450),("Relizane",600,370),
    ("Timimoun",750,500),("Bordj Badji Mokhtar",900,650),("Ouled Djellal",650,400),
    ("Beni Abbes",750,500),("In Salah",850,600),("In Guezzam",950,700),("Touggourt",700,450),
    ("Djanet",950,700),("El Meghaier",700,450),("El Meniaa",750,500),
]
created_count = 0
for wilaya, dom, bur in WILAYAS:
    _, created = ShippingRate.objects.get_or_create(
        wilaya=wilaya,
        defaults={'price_domicile':dom,'price_bureau':bur,'is_active':True}
    )
    if created: created_count += 1
print(f"  ✅ {created_count} nouveaux tarifs, {len(WILAYAS)-created_count} existants.")

print(f"\n🎉 Termine! 4 categories, 6 produits, 58 tarifs de livraison.")
