#!/usr/bin/env node
/**
 * Script pour appliquer les migrations Prisma à la base de données de production
 * Gère les différentes variables d'environnement: PRISMA_DATABASE_URL, DATABASE_URL, POSTGRES_URL
 */

const { execSync } = require('child_process')

function log(message) {
  console.log(message)
}

function error(message) {
  console.error(message)
  process.exit(1)
}

async function main() {
  log('🔍 Vérification des variables d\'environnement...')

  // Vérifier quelle variable d'environnement est disponible
  let databaseUrl = process.env.PRISMA_DATABASE_URL || 
                    process.env.DATABASE_URL || 
                    process.env.POSTGRES_URL

  if (!databaseUrl) {
    error('❌ Aucune variable d\'environnement de base de données trouvée!\n' +
          '   Variables disponibles: PRISMA_DATABASE_URL, DATABASE_URL, POSTGRES_URL')
  }

  // Priorité: PRISMA_DATABASE_URL > DATABASE_URL > POSTGRES_URL
  if (process.env.PRISMA_DATABASE_URL) {
    log('✅ Utilisation de PRISMA_DATABASE_URL')
    process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL
  } else if (process.env.DATABASE_URL) {
    log('✅ Utilisation de DATABASE_URL')
  } else if (process.env.POSTGRES_URL) {
    log('✅ Utilisation de POSTGRES_URL (mappé vers DATABASE_URL)')
    process.env.DATABASE_URL = process.env.POSTGRES_URL
  }
  
  // Masquer le mot de passe dans les logs
  const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@')
  log(`🔌 Connexion à la base de données: ${maskedUrl}`)

  try {
    log('📦 Génération du client Prisma...')
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: process.env,
      cwd: __dirname + '/..'
    })

    log('🚀 Application des migrations à la base de données...')
    log('   (Cette étape peut prendre quelques secondes...)')
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: process.env,
      cwd: __dirname + '/..'
    })

    log('✅ Migrations appliquées avec succès!')
  } catch (err) {
    error(`❌ Erreur lors de l'application des migrations:\n${err.message}\n\n` +
          '💡 Vérifiez que:\n' +
          '   - Les variables d\'environnement sont correctement configurées dans Vercel\n' +
          '   - La base de données est accessible\n' +
          '   - Les migrations sont présentes dans prisma/migrations/')
  }
}

main()

