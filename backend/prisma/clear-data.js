const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Charger .env.development
const envPath = path.resolve(__dirname, '../.env.development')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    }
  })
}

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  console.error('Please make sure .env.development exists with DATABASE_URL')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Starting data cleanup...')

  try {
    // Supprimer toutes les ventes
    const deletedSales = await prisma.sale.deleteMany({})
    console.log(`✅ Deleted ${deletedSales.count} sales`)

    // Supprimer tous les achats
    const deletedPurchases = await prisma.purchase.deleteMany({})
    console.log(`✅ Deleted ${deletedPurchases.count} purchases`)

    // Supprimer tous les produits
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`✅ Deleted ${deletedProducts.count} products`)

    // Supprimer tous les taux de change
    const deletedExchangeRates = await prisma.exchangeRate.deleteMany({})
    console.log(`✅ Deleted ${deletedExchangeRates.count} exchange rates`)

    console.log('🎉 Data cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error cleaning data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

