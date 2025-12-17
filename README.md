# 📦 Stock Management System

## 📝 Description

Système moderne de **gestion de stock** avec calcul automatique du **bénéfice et de la perte**, intégrant une **conversion de devises RMB ⇄ MGA** pour l’achat de produits en Chine et la vente à Madagascar.

Le projet repose sur une architecture **full stack scalable et serverless**, adaptée au déploiement sur **Vercel**, et permet un suivi précis des coûts, des ventes et des marges en tenant compte des taux de change utilisés.

---

## 🚀 Fonctionnalités

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
├── frontend/        # Application Vue 3
├── backend/         # Next.js (API serverless)
├── prisma/          # Schéma Prisma
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
npm install
```

### 3️⃣ Configuration des variables d’environnement

Créer un fichier `.env` :

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### 4️⃣ Initialiser la base de données

```bash
npx prisma migrate dev
npx prisma generate
```

### 5️⃣ Lancer le projet

```bash
npm run dev
```

---

## 🔐 Sécurité & bonnes pratiques

* Utilisation d’un ORM (Prisma) pour éviter les injections SQL
* Stockage sécurisé des variables sensibles via `.env`
* Architecture prête pour l’ajout d’authentification et de rôles utilisateurs

---

## 🧩 Améliorations futures

* Authentification (Admin / Vendeur)
* Gestion multi-devises (USD, EUR, CNY)
* Dashboard analytique
* Export Excel / PDF
* Intégration API de taux de change en temps réel

---

## 👨‍💻 Auteur

**Faniry Zo Rabemananjara**
IT Engineer / Full Stack Developer

---

## 📄 Licence

Ce projet est sous licence MIT.
