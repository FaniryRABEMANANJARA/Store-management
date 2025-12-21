-- Migration pour ajouter le champ fieldConfig aux catégories
-- Ce champ permet de stocker la configuration des champs dynamiques pour chaque catégorie

-- Ajouter la colonne fieldConfig (JSON) à la table categories
ALTER TABLE "categories" 
ADD COLUMN IF NOT EXISTS "fieldConfig" JSONB;

-- Optionnel: Ajouter des configurations par défaut pour les catégories existantes
-- Vous pouvez personnaliser ces configurations selon vos besoins

-- Configuration pour "Téléphones" (si elle existe)
UPDATE "categories" 
SET "fieldConfig" = '[
  {"key": "model", "type": "text", "label": "Modèle", "placeholder": "Ex: iPhone 15 Pro Max", "icon": "mdi-cellphone", "cols": 12, "md": 6},
  {"key": "color", "type": "text", "label": "Couleur", "placeholder": "Ex: Bleu Titanium, Noir, Blanc", "icon": "mdi-palette", "cols": 12, "md": 6},
  {"key": "storage", "type": "select", "label": "Stockage", "icon": "mdi-harddisk", "items": ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"], "cols": 12, "md": 6},
  {"key": "battery", "type": "text", "label": "Batterie", "placeholder": "Ex: 4000mAh", "icon": "mdi-battery", "cols": 12, "md": 6},
  {"key": "simType", "type": "select", "label": "Type de SIM", "icon": "mdi-sim", "items": [{"text": "Dual SIM", "value": "dual_sim"}, {"text": "eSIM", "value": "esim"}, {"text": "Dual SIM + eSIM", "value": "dual_sim_esim"}], "itemTitle": "text", "itemValue": "value", "cols": 12, "md": 6}
]'::jsonb
WHERE "name" = 'Téléphones';

-- Configuration pour "Ordinateurs" (si elle existe)
UPDATE "categories" 
SET "fieldConfig" = '[
  {"key": "model", "type": "text", "label": "Modèle", "placeholder": "Ex: MacBook Air M2", "icon": "mdi-laptop", "cols": 12, "md": 6},
  {"key": "color", "type": "text", "label": "Couleur", "placeholder": "Ex: Gris sidéral, Argent", "icon": "mdi-palette", "cols": 12, "md": 6},
  {"key": "storage", "type": "select", "label": "Stockage", "icon": "mdi-harddisk", "items": ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"], "cols": 12, "md": 6},
  {"key": "ram", "type": "select", "label": "RAM", "icon": "mdi-memory", "items": ["4GB", "8GB", "16GB", "32GB", "64GB"], "cols": 12, "md": 6},
  {"key": "processor", "type": "text", "label": "Processeur", "placeholder": "Ex: M2, M2 Pro, Intel i7", "icon": "mdi-chip", "cols": 12, "md": 6},
  {"key": "screenSize", "type": "select", "label": "Taille d''écran", "icon": "mdi-monitor", "items": ["11\"", "13\"", "14\"", "15\"", "16\"", "17\""], "cols": 12, "md": 6},
  {"key": "graphics", "type": "text", "label": "Carte graphique", "placeholder": "Ex: M2 GPU, NVIDIA RTX 3060", "icon": "mdi-gpu", "cols": 12, "md": 6}
]'::jsonb
WHERE "name" = 'Ordinateurs';

