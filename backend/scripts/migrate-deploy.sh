#!/bin/bash
# Script pour appliquer les migrations Prisma à la base de données de production
# Ce script gère les différentes variables d'environnement possibles

set -e

echo "🔍 Vérification des variables d'environnement..."

# Vérifier quelle variable d'environnement est disponible
if [ -n "$PRISMA_DATABASE_URL" ]; then
  echo "✅ Utilisation de PRISMA_DATABASE_URL"
  export DATABASE_URL="$PRISMA_DATABASE_URL"
elif [ -n "$DATABASE_URL" ]; then
  echo "✅ Utilisation de DATABASE_URL"
elif [ -n "$POSTGRES_URL" ]; then
  echo "✅ Utilisation de POSTGRES_URL"
  export DATABASE_URL="$POSTGRES_URL"
else
  echo "❌ Aucune variable d'environnement de base de données trouvée!"
  echo "   Variables disponibles: PRISMA_DATABASE_URL, DATABASE_URL, POSTGRES_URL"
  exit 1
fi

echo "📦 Génération du client Prisma..."
npx prisma generate

echo "🚀 Application des migrations à la base de données..."
npx prisma migrate deploy

echo "✅ Migrations appliquées avec succès!"

