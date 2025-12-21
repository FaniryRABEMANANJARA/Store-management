import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function diagnoseDatabase() {
  try {
    console.log('🔍 Diagnostic de la base de données...\n')

    // Test de connexion
    console.log('1️⃣ Test de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion réussie\n')

    // Vérifier les modèles disponibles
    console.log('2️⃣ Vérification des modèles Prisma...')
    const models = ['Category', 'SubCategory', 'Product', 'Order', 'Purchase', 'Sale', 'ExchangeRate', 'User']
    
    for (const model of models) {
      try {
        // Essayer d'accéder au modèle
        const modelName = model.toLowerCase() as any
        const count = await (prisma as any)[modelName].count()
        console.log(`   ✅ ${model}: ${count} enregistrement(s)`)
      } catch (error: any) {
        console.log(`   ❌ ${model}: ${error.message}`)
      }
    }

    console.log('\n3️⃣ Test des requêtes spécifiques...')

    // Test Category
    try {
      const categories = await prisma.category.findMany({ take: 1 })
      console.log('   ✅ Category.findMany() fonctionne')
    } catch (error: any) {
      console.log(`   ❌ Category.findMany() échoue: ${error.message}`)
      if (error.code) console.log(`      Code: ${error.code}`)
    }

    // Test Product avec relations
    try {
      const products = await prisma.product.findMany({
        take: 1,
        include: {
          category: true,
          subCategory: true,
        }
      })
      console.log('   ✅ Product.findMany() avec relations fonctionne')
    } catch (error: any) {
      console.log(`   ❌ Product.findMany() échoue: ${error.message}`)
      if (error.code) console.log(`      Code: ${error.code}`)
    }

    // Test Purchase
    try {
      const purchases = await prisma.purchase.findMany({ take: 1 })
      console.log('   ✅ Purchase.findMany() fonctionne')
    } catch (error: any) {
      console.log(`   ❌ Purchase.findMany() échoue: ${error.message}`)
      if (error.code) console.log(`      Code: ${error.code}`)
    }

    // Test Sale
    try {
      const sales = await prisma.sale.findMany({ take: 1 })
      console.log('   ✅ Sale.findMany() fonctionne')
    } catch (error: any) {
      console.log(`   ❌ Sale.findMany() échoue: ${error.message}`)
      if (error.code) console.log(`      Code: ${error.code}`)
    }

    // Vérifier la structure de la table products
    console.log('\n4️⃣ Structure de la table products...')
    try {
      const productColumns = await prisma.$queryRaw<Array<{
        column_name: string
        data_type: string
      }>>`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'products'
        ORDER BY ordinal_position
      `
      console.log('   Colonnes trouvées:')
      productColumns.forEach(col => {
        console.log(`      - ${col.column_name} (${col.data_type})`)
      })
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }

    // Vérifier les foreign keys
    console.log('\n5️⃣ Foreign Keys...')
    try {
      const foreignKeys = await prisma.$queryRaw<Array<{
        constraint_name: string
        table_name: string
        column_name: string
        foreign_table_name: string
      }>>`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        ORDER BY tc.table_name
      `
      console.log('   Foreign Keys trouvées:')
      foreignKeys.forEach(fk => {
        console.log(`      - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}`)
      })
    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }

    console.log('\n✅ Diagnostic terminé')

  } catch (error: any) {
    console.error('❌ Erreur lors du diagnostic:', error.message)
    if (error.code) {
      console.error('   Code:', error.code)
    }
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseDatabase()

