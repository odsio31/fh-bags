"""
Run: python seed_shipping.py  (depuis backend/ avec venv active)
Charge les 58 wilayas algeriennes avec leurs tarifs par defaut.
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/..')
django.setup()

from shipping.models import ShippingRate

WILAYAS = [
    ("Adrar",               700, 450),
    ("Chlef",               600, 370),
    ("Laghouat",            650, 400),
    ("Oum El Bouaghi",      600, 370),
    ("Batna",               600, 370),
    ("Bejaia",              600, 370),
    ("Biskra",              650, 400),
    ("Bechar",              700, 450),
    ("Blida",               500, 320),
    ("Bouira",              550, 350),
    ("Tamanrasset",         800, 550),
    ("Tebessa",             650, 400),
    ("Tlemcen",             650, 400),
    ("Tiaret",              600, 370),
    ("Tizi Ouzou",          550, 350),
    ("Alger",               500, 320),
    ("Djelfa",              600, 370),
    ("Jijel",               600, 370),
    ("Setif",               600, 370),
    ("Saida",               600, 370),
    ("Skikda",              600, 370),
    ("Sidi Bel Abbes",      650, 400),
    ("Annaba",              600, 370),
    ("Guelma",              600, 370),
    ("Constantine",         600, 370),
    ("Medea",               550, 350),
    ("Mostaganem",          600, 370),
    ("MSila",               600, 370),
    ("Mascara",             600, 370),
    ("Ouargla",             700, 450),
    ("Oran",                600, 370),
    ("El Bayadh",           700, 450),
    ("Illizi",              900, 650),
    ("Bordj Bou Arreridj",  600, 370),
    ("Boumerdes",           500, 320),
    ("El Tarf",             600, 370),
    ("Tindouf",             900, 650),
    ("Tissemsilt",          600, 370),
    ("El Oued",             700, 450),
    ("Khenchela",           650, 400),
    ("Souk Ahras",          650, 400),
    ("Tipaza",              500, 320),
    ("Mila",                600, 370),
    ("Ain Defla",           550, 350),
    ("Naama",               700, 450),
    ("Ain Temouchent",      650, 400),
    ("Ghardaia",            700, 450),
    ("Relizane",            600, 370),
    ("Timimoun",            750, 500),
    ("Bordj Badji Mokhtar", 900, 650),
    ("Ouled Djellal",       650, 400),
    ("Beni Abbes",          750, 500),
    ("In Salah",            850, 600),
    ("In Guezzam",          950, 700),
    ("Touggourt",           700, 450),
    ("Djanet",              950, 700),
    ("El Meghaier",         700, 450),
    ("El Meniaa",           750, 500),
]

created = 0
updated = 0
for wilaya, dom, bur in WILAYAS:
    obj, c = ShippingRate.objects.get_or_create(
        wilaya=wilaya,
        defaults={'price_domicile': dom, 'price_bureau': bur, 'is_active': True}
    )
    if c:
        created += 1
    print(f"{'✅ Cree' if c else '⚡ Existe'}: {wilaya:30} — Domicile: {dom} DA / Bureau: {bur} DA")

print(f"\n🎉 Termine! {created} crees, {len(WILAYAS)-created} existants.")
