# 👜 F&H BAGS — Full-Stack E-Commerce v6

React + Django REST Framework + PostgreSQL

---

## 📁 Structure du Projet

```
fh-bags/
├── backend/
│   ├── config/         # Settings, URLs, WSGI
│   ├── products/       # Produits, Images, Couleurs
│   ├── orders/         # Commandes
│   ├── shipping/       # Tarifs de livraison par wilaya
│   ├── admin_api/      # API Dashboard Admin
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_data.py    # Données initiales (produits + tarifs)
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/      # Home, Shop, ProductDetail, Cart, Checkout...
        ├── components/ # Navbar, Footer, ProductCard, Toast
        ├── context/    # CartContext
        ├── services/   # api.js
        └── admin/      # Dashboard Admin complet
```

---

## 🚀 Installation (Windows)

### 1. Créer la base de données PostgreSQL

Dans pgAdmin ou psql :
```sql
CREATE DATABASE fhbags_db;
CREATE USER fhbags_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE fhbags_db TO fhbags_user;
```

### 2. Backend

```cmd
cd fh-bags\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
notepad .env
```

Dans `.env`, renseigner :
```
SECRET_KEY=fhbags-secret-key-changez-moi-2025
DEBUG=True
DB_NAME=fhbags_db
DB_USER=fhbags_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

```cmd
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python seed_data.py
python manage.py runserver
```

### 3. Frontend

```cmd
cd fh-bags\frontend
npm install
npm run dev
```

---

## 🔗 URLs

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Site boutique |
| http://localhost:5173/admin/login | Connexion admin |
| http://localhost:5173/admin | Dashboard & stats |
| http://localhost:5173/admin/commandes | Gestion commandes |
| http://localhost:5173/admin/produits | Produits + photos + couleurs |
| http://localhost:5173/admin/categories | Catégories |
| http://localhost:5173/admin/livraison | Tarifs livraison par wilaya |
| http://localhost:8000/admin | Django admin |

---

## ✨ Fonctionnalités

### Site Client
- 🛍️ Boutique avec filtres par catégorie, prix et recherche
- 🖼️ Galerie multi-photos par produit (vignettes cliquables)
- 🎨 Sélecteur de couleurs avec stock par couleur
- 🛒 Panier localStorage (sans connexion)
- 📍 Checkout avec sélection wilaya → **prix livraison automatique**
- ✅ Page de confirmation avec récapitulatif complet

### Dashboard Admin
- 📊 Statistiques + graphique ventes 7 jours
- 📦 Gestion commandes (filtres, statut, détails, WhatsApp)
- 🛍️ Gestion produits (infos + multi-photos + couleurs)
- 🗂️ Gestion catégories
- 🚚 **Tarifs livraison par wilaya** (domicile & bureau)
  - Modification individuelle ou en lot
  - 58 wilayas pré-configurées

---

## 🚚 Tarifs Livraison

Les tarifs sont gérés depuis `/admin/livraison` :
- **Domicile** : prix personnalisé par wilaya (défaut 600 DA)
- **Bureau Yallidine** : prix personnalisé par wilaya (défaut 370 DA)
- Modification en lot de toutes les wilayas en une fois
- Activation/désactivation par wilaya

Le prix affiché dans le checkout se met à jour **automatiquement** selon la wilaya choisie.

---

## 📦 Commandes rapides

```cmd
rem Backend
venv\Scripts\activate
python manage.py runserver

rem Frontend
npm run dev
```
