import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Utiliser PRISMA_DATABASE_URL si disponible (Prisma Accelerate)
// Sinon utiliser DATABASE_URL (connexion directe)
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL or PRISMA_DATABASE_URL is not set!')
  console.error('Current NODE_ENV:', process.env.NODE_ENV)
  throw new Error('DATABASE_URL or PRISMA_DATABASE_URL environment variable is required')
}

// Log pour debug (uniquement en développement)
if (process.env.NODE_ENV === 'development') {
  const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@')
  console.log('🔌 Connecting to database:', maskedUrl)
  console.log('📁 Environment file loaded from:', process.env.NODE_ENV === 'development' ? '.env.development' : '.env')
  
  // Avertir si on utilise la base distante en développement
  if (databaseUrl.includes('db.prisma.io') || databaseUrl.includes('prisma-data.net')) {
    console.warn('⚠️  WARNING: Using remote database in development!')
    console.warn('⚠️  Make sure backend/.env.development contains your local DATABASE_URL')
  }
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const client = createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

// Fonction pour obtenir Prisma Client (garantit l'initialisation)
export function getPrisma() {
  const client = getPrismaClient()
  if (!client) {
    throw new Error('Failed to initialize Prisma Client')
  }
  return client
}

// Initialiser Prisma Client au chargement du module
let prismaClient: PrismaClient | null = null

try {
  prismaClient = getPrismaClient()
  
  // Vérification de l'initialisation
  if (!prismaClient) {
    throw new Error('Failed to initialize Prisma Client')
  }

  // Log de confirmation en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Prisma Client initialized successfully')
  }
} catch (error) {
  console.error('❌ Error initializing Prisma Client:', error)
  throw error
}

// Exporter Prisma Client
export const prisma = prismaClient!

