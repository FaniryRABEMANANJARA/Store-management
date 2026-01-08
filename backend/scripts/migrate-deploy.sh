#!/bin/bash
# Script pour appliquer les migrations Prisma à la base de données de production
# Ce script gère les différentes variables d'environnement possibles
# Pour les migrations, utilise une connexion directe (non poolée) pour éviter "too many clients"

set -e

echo "🔍 Vérification des variables d'environnement..."

# Pour les migrations, utiliser une connexion directe (non poolée)
# Priorité: POSTGRES_URL_NON_POOLING > DATABASE_URL > POSTGRES_URL > PRISMA_DATABASE_URL
if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
  echo "✅ Utilisation de POSTGRES_URL_NON_POOLING (connexion directe pour migrations)"
  export DATABASE_URL="$POSTGRES_URL_NON_POOLING"
elif [ -n "$DATABASE_URL" ] && [[ ! "$DATABASE_URL" =~ "prisma+" ]] && [[ ! "$DATABASE_URL" =~ "accelerate.prisma-data.net" ]]; then
  echo "✅ Utilisation de DATABASE_URL (connexion directe)"
  # DATABASE_URL est déjà défini, pas besoin de l'exporter
elif [ -n "$POSTGRES_URL" ]; then
  echo "✅ Utilisation de POSTGRES_URL (connexion directe)"
  export DATABASE_URL="$POSTGRES_URL"
elif [ -n "$PRISMA_DATABASE_URL" ]; then
  echo "⚠️  Utilisation de PRISMA_DATABASE_URL (connexion poolée)"
  echo "   ⚠️  ATTENTION: Les migrations peuvent échouer avec Prisma Accelerate"
  echo "   💡 Recommandation: Configurez POSTGRES_URL_NON_POOLING dans Vercel"
  export DATABASE_URL="$PRISMA_DATABASE_URL"
else
  echo "❌ Aucune variable d'environnement de base de données trouvée!"
  echo "   Variables disponibles: POSTGRES_URL_NON_POOLING, DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL"
  echo ""
  echo "💡 Pour les migrations, configurez POSTGRES_URL_NON_POOLING dans Vercel:"
  echo "   - Variable: POSTGRES_URL_NON_POOLING"
  echo "   - Valeur: postgres://user:password@host:port/database (sans pgbouncer)"
  exit 1
fi

echo "📦 Génération du client Prisma..."
npx prisma generate

echo "🚀 Application des migrations à la base de données..."
echo "   (Utilisation d'une connexion directe pour éviter 'too many clients')"

# Exécuter les migrations avec gestion d'erreur améliorée
if npx prisma migrate deploy; then
echo "✅ Migrations appliquées avec succès!"
else
  EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ Erreur lors de l'application des migrations!"
    echo ""
    echo "💡 Si vous voyez 'too many clients already':"
    echo "   1. Ajoutez POSTGRES_URL_NON_POOLING dans Vercel (Settings → Environment Variables)"
    echo "   2. Utilisez une connexion directe (sans pgbouncer)"
    echo "   3. Format: postgres://user:password@host:port/database"
    echo "   4. Redéployez votre application"
    echo ""
    exit $EXIT_CODE
  fi
fi

