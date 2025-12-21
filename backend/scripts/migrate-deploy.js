#!/usr/bin/env node
/**
 * Script pour appliquer les migrations Prisma à la base de données de production
 * Gère les différentes variables d'environnement: PRISMA_DATABASE_URL, DATABASE_URL, POSTGRES_URL
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function log(message) {
  console.log(message)
}

function error(message) {
  console.error(message)
  process.exit(1)
}

// Charger .env.development si on est en local et qu'il existe
function loadLocalEnv() {
  const isLocal = !process.env.VERCEL && process.env.NODE_ENV !== 'production'
  if (isLocal) {
    const envPath = path.resolve(__dirname, '../.env.development')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = value
            }
          }
        }
      })
      log('📁 Variables chargées depuis .env.development')
    }
  }
}

async function main() {
  // Charger les variables d'environnement locales si nécessaire
  loadLocalEnv()
  
  log('🔍 Vérification des variables d\'environnement...')

  // Vérifier quelle variable d'environnement est disponible
  let databaseUrl = process.env.PRISMA_DATABASE_URL || 
                    process.env.DATABASE_URL || 
                    process.env.POSTGRES_URL

  // Détecter si on est en production (Vercel) ou en développement local
  const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  const isLocal = !isProduction

  if (!databaseUrl) {
    if (isLocal) {
      log('⚠️  Aucune variable d\'environnement de base de données trouvée (mode local)')
      log('📦 Génération du client Prisma uniquement (sans migrations)...')
      try {
        execSync('npx prisma generate', { 
          stdio: 'inherit',
          env: process.env,
          cwd: __dirname + '/..'
        })
        log('✅ Client Prisma généré avec succès!')
        log('💡 Pour appliquer les migrations localement, utilisez: yarn prisma:migrate')
        return // Sortir sans erreur
      } catch (err) {
        log('⚠️  Erreur lors de la génération du client Prisma (non bloquant en local)')
        log('   Vous pouvez continuer, mais assurez-vous d\'avoir DATABASE_URL dans .env.development')
        return // Sortir sans erreur même en cas d'erreur
      }
    } else {
      // En production, c'est une erreur critique
      error('❌ Aucune variable d\'environnement de base de données trouvée!\n' +
            '   Variables disponibles: PRISMA_DATABASE_URL, DATABASE_URL, POSTGRES_URL')
    }
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

    // En production, appliquer les migrations
    // En local, on peut skip si l'utilisateur préfère utiliser prisma migrate dev
    if (isProduction) {
      log('🚀 Application des migrations à la base de données (production)...')
      log('   (Cette étape peut prendre quelques secondes...)')
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        env: process.env,
        cwd: __dirname + '/..'
      })
      log('✅ Migrations appliquées avec succès!')
    } else {
      log('💡 Mode local: migrations non appliquées automatiquement')
      log('   Pour appliquer les migrations localement: yarn prisma:migrate')
    }
  } catch (err) {
    if (isProduction) {
      error(`❌ Erreur lors de l'application des migrations:\n${err.message}\n\n` +
            '💡 Vérifiez que:\n' +
            '   - Les variables d\'environnement sont correctement configurées dans Vercel\n' +
            '   - La base de données est accessible\n' +
            '   - Les migrations sont présentes dans prisma/migrations/')
    } else {
      log(`⚠️  Erreur lors de la génération (mode local, non bloquant): ${err.message}`)
      log('   Vous pouvez continuer, mais assurez-vous d\'avoir DATABASE_URL dans .env.development')
    }
  }
}

main()

