# 📦 Stock Management System

## 📝 Description

Système moderne de **gestion de stock** avec calcul automatique du **bénéfice et de la perte**, intégrant une **conversion de devises RMB ⇄ MGA** pour l’achat de produits en Chine et la vente à Madagascar.

Le projet repose sur une architecture **full stack scalable et serverless**, adaptée au déploiement sur **Vercel**, et permet un suivi précis des coûts, des ventes et des marges en tenant compte des taux de change utilisés.

---

## 🚀 Fonctionnalités

* **Authentification sécurisée** (Login / Register) avec JWT
* Gestion des produits et du stock
* Enregistrement des achats en **RMB**
* Enregistrement des ventes en **MGA**
* Conversion automatique **RMB → MGA**
* Calcul du **bénéfice / perte par produit**
* Historique des transactions (achats & ventes)
* Gestion des taux de change (manuel ou automatisable)
* Architecture prête pour le serverless

---

## 🛠️ Stack technique

### Frontend

* **Vue 3**
* Composition API

### Backend

* **Next.js** (API Routes / App Router)
* Architecture serverless

### Base de données

* **PostgreSQL** (Vercel Postgres / Neon)
* **Prisma ORM**

### Déploiement

* **Vercel**

---

## 🧱 Architecture du projet

```
root/
├── frontend/              # Application Vue 3
│   ├── public/            # Fichiers statiques (favicon, images publiques)
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/        # Assets traités par Vite
│   │   │   ├── images/    # Images (logos, photos)
│   │   │   ├── icons/     # Icônes SVG
│   │   │   └── fonts/     # Polices personnalisées
│   │   ├── views/         # Pages Vue
│   │   ├── api/           # Client API
│   │   ├── composables/   # Composables Vue
│   │   ├── plugins/       # Plugins (Vuetify)
│   │   └── main.ts
│   └── package.json
├── backend/               # Next.js (API serverless)
│   ├── app/
│   │   └── api/           # API Routes
│   ├── lib/               # Utilitaires (Prisma client, auth)
│   ├── prisma/
│   │   └── schema.prisma  # Schéma Prisma
│   └── package.json
├── package.json           # Workspace root
├── README.md
└── .env
```

---

## 💱 Gestion des devises

* Les achats sont effectués en **RMB**
* Les ventes sont enregistrées en **MGA**
* Chaque achat conserve le **taux de change utilisé** afin de garantir un calcul fiable des marges, même si le taux évolue dans le temps

---

## 📊 Calcul du bénéfice / perte

**Formule utilisée :**

```
Coût total (MGA) = Prix d’achat (RMB) × Taux de change × Quantité
Revenu total (MGA) = Prix de vente (MGA) × Quantité
Bénéfice / Perte = Revenu total − Coût total
```

---

## ⚙️ Installation & configuration

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/votre-username/stock-management.git
cd stock-management
```

### 2️⃣ Installer les dépendances

```bash
yarn install
```

### 3️⃣ Configuration des variables d'environnement

Le projet utilise des fichiers d'environnement séparés pour le développement et la production.

#### 📝 Développement LOCAL

Configurer le fichier `.env.development` dans le dossier `backend/` :

```env
# Base de données PostgreSQL LOCALE
DATABASE_URL="postgresql://username:password@localhost:5432/store_management"

# Secret JWT pour le développement
JWT_SECRET="dev-secret-key-change-in-production"

# URL de l'API
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**Important :** Utilisez toujours votre base de données **locale** en développement, pas la base de production.

#### 🚀 Production

Les variables d'environnement de production sont configurées dans **Vercel** (Settings → Environment Variables) :

- `DATABASE_URL` : Base de données de production
- `PRISMA_DATABASE_URL` : Prisma Accelerate (optionnel)
- `JWT_SECRET` : Secret fort pour la production
- `NEXT_PUBLIC_API_URL` : URL de l'API de production

**Note :** Next.js charge automatiquement `.env.development` en mode développement et les variables Vercel en production.

### 4️⃣ Initialiser la base de données

```bash
# Générer le client Prisma
yarn prisma:generate

# Créer et appliquer les migrations
yarn prisma:migrate
```

### 5️⃣ Lancer le projet

```bash
# Lancer le backend (port 3000) et le frontend (port 5173) simultanément
yarn dev
```

**Ou séparément :**

```bash
# Backend uniquement
yarn workspace backend dev

# Frontend uniquement
yarn workspace frontend dev
```

---

## 🔐 Sécurité & bonnes pratiques

* **Authentification JWT** avec tokens sécurisés
* Mots de passe hashés avec bcrypt
* Utilisation d'un ORM (Prisma) pour éviter les injections SQL
* Stockage sécurisé des variables sensibles via `.env`
* Protection des routes avec guards d'authentification
* Gestion des rôles utilisateurs (user, admin)

---

## 🧩 Améliorations futures

* Gestion avancée des rôles (Admin / Vendeur / Manager)
* Gestion multi-devises (USD, EUR, CNY)
* Dashboard analytique
* Export Excel / PDF
* Intégration API de taux de change en temps réel
* Réinitialisation de mot de passe par email

---

## 👨‍💻 Auteur

**Faniry Zo Rabemananjara**
IT Engineer / Full Stack Developer

---

## 📄 Licence

Ce projet est sous licence MIT.
