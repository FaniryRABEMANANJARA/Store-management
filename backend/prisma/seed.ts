import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Vérifier si un taux de change actif existe déjà
  let exchangeRate = await prisma.exchangeRate.findFirst({
    where: { isActive: true },
  })

  if (!exchangeRate) {
    // Créer un taux de change initial
    exchangeRate = await prisma.exchangeRate.create({
      data: {
        rate: 5000, // 1 RMB = 5000 MGA (exemple)
        isActive: true,
      },
    })
    console.log('✅ Exchange rate created:', exchangeRate)
  } else {
    console.log('✅ Exchange rate already exists:', exchangeRate)
  }

  // Vérifier si des produits existent déjà
  const existingProducts = await prisma.product.findMany()
  
  let product1, product2, product3

  if (existingProducts.length === 0) {
    // Créer quelques produits d'exemple
    product1 = await prisma.product.create({
      data: {
        name: 'Téléphone portable',
        description: 'Smartphone Android',
      },
    })

    product2 = await prisma.product.create({
      data: {
        name: 'Ordinateur portable',
        description: 'Laptop 15 pouces',
      },
    })

    product3 = await prisma.product.create({
      data: {
        name: 'Tablette',
        description: 'Tablette 10 pouces',
      },
    })

    console.log('✅ Products created:', { product1, product2, product3 })
  } else {
    product1 = existingProducts[0]
    product2 = existingProducts[1] || existingProducts[0]
    product3 = existingProducts[2] || existingProducts[0]
    console.log('✅ Products already exist, using existing products')
  }

  // Créer quelques achats d'exemple
  const purchase1 = await prisma.purchase.create({
    data: {
      productId: product1.id,
      quantity: 10,
      priceRMB: 500,
      exchangeRate: exchangeRate.rate,
      totalCostMGA: 500 * exchangeRate.rate * 10,
    },
  })

  const purchase2 = await prisma.purchase.create({
    data: {
      productId: product2.id,
      quantity: 5,
      priceRMB: 3000,
      exchangeRate: exchangeRate.rate,
      totalCostMGA: 3000 * exchangeRate.rate * 5,
    },
  })

  console.log('✅ Purchases created:', { purchase1, purchase2 })

  // Créer quelques ventes d'exemple
  const sale1 = await prisma.sale.create({
    data: {
      productId: product1.id,
      quantity: 3,
      priceMGA: 3000000, // 3 000 000 MGA
      totalRevenue: 3000000 * 3,
    },
  })

  const sale2 = await prisma.sale.create({
    data: {
      productId: product2.id,
      quantity: 2,
      priceMGA: 20000000, // 20 000 000 MGA
      totalRevenue: 20000000 * 2,
    },
  })

  console.log('✅ Sales created:', { sale1, sale2 })

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

