import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Utiliser PRISMA_DATABASE_URL si disponible (Prisma Accelerate)
// Sinon utiliser DATABASE_URL (connexion directe)
const databaseUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL

const prismaClient = globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

