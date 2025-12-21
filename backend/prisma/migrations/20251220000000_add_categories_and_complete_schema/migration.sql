-- Migration pour ajouter les tables et colonnes manquantes
-- Cette migration complète le schéma pour correspondre au schema.prisma actuel

-- Créer la table categories
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Créer l'index unique sur categories.name
CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");

-- Créer la table sub_categories
CREATE TABLE IF NOT EXISTS "sub_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- Créer l'index unique composite sur sub_categories (name, categoryId)
CREATE UNIQUE INDEX IF NOT EXISTS "sub_categories_name_categoryId_key" ON "sub_categories"("name", "categoryId");

-- Ajouter la foreign key de sub_categories vers categories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sub_categories_categoryId_fkey'
    ) THEN
        ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Ajouter les colonnes manquantes à la table products
ALTER TABLE "products" 
ADD COLUMN IF NOT EXISTS "categoryId" TEXT,
ADD COLUMN IF NOT EXISTS "subCategoryId" TEXT,
ADD COLUMN IF NOT EXISTS "color" TEXT,
ADD COLUMN IF NOT EXISTS "storage" TEXT,
ADD COLUMN IF NOT EXISTS "model" TEXT,
ADD COLUMN IF NOT EXISTS "battery" TEXT,
ADD COLUMN IF NOT EXISTS "simType" TEXT,
ADD COLUMN IF NOT EXISTS "condition" TEXT,
ADD COLUMN IF NOT EXISTS "ram" TEXT,
ADD COLUMN IF NOT EXISTS "processor" TEXT,
ADD COLUMN IF NOT EXISTS "screenSize" TEXT,
ADD COLUMN IF NOT EXISTS "graphics" TEXT;

-- Créer une catégorie par défaut pour les produits existants
DO $$ 
DECLARE
    default_category_id TEXT;
BEGIN
    -- Vérifier si une catégorie "Autre" existe déjà
    SELECT id INTO default_category_id FROM "categories" WHERE "name" = 'Autre' LIMIT 1;
    
    -- Si elle n'existe pas, la créer
    IF default_category_id IS NULL THEN
        default_category_id := gen_random_uuid()::TEXT;
        INSERT INTO "categories" ("id", "name", "description", "createdAt", "updatedAt")
        VALUES (default_category_id, 'Autre', 'Catégorie par défaut', NOW(), NOW());
    END IF;
    
    -- Mettre à jour tous les produits qui n'ont pas de categoryId
    UPDATE "products" 
    SET "categoryId" = default_category_id 
    WHERE "categoryId" IS NULL;
END $$;

-- Maintenant rendre categoryId NOT NULL
DO $$ 
BEGIN
    -- Vérifier si la colonne est déjà NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'categoryId' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;
    END IF;
END $$;

-- Ajouter les foreign keys pour products
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_categoryId_fkey'
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" 
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_subCategoryId_fkey'
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_subCategoryId_fkey" 
        FOREIGN KEY ("subCategoryId") REFERENCES "sub_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Créer la table orders
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceRMB" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "totalCostMGA" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- Ajouter la foreign key de orders vers products
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_productId_fkey'
    ) THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

