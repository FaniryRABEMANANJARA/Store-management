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
  console.log('🌱 Starting database seed...')

  // Créer les catégories et sous-catégories
  console.log('📁 Creating categories and subcategories...')
  
  // Catégorie: Téléphones
  let phoneCategory = await prisma.category.findUnique({
    where: { name: 'Téléphones' },
  })
  
  if (!phoneCategory) {
    phoneCategory = await prisma.category.create({
      data: {
        name: 'Téléphones',
        description: 'Smartphones et téléphones portables',
        subCategories: {
          create: [
            { name: 'iPhone', description: 'Téléphones Apple iPhone' },
            { name: 'Samsung', description: 'Téléphones Samsung Galaxy' },
          ],
        },
      },
    })
    console.log('✅ Phone category created with subcategories')
  } else {
    console.log('✅ Phone category already exists')
    // Vérifier et créer les sous-catégories si elles n'existent pas
    const phoneSubCategories = await prisma.subCategory.findMany({
      where: { categoryId: phoneCategory.id },
    })
    
    if (phoneSubCategories.length === 0) {
      await prisma.subCategory.createMany({
        data: [
          { name: 'iPhone', description: 'Téléphones Apple iPhone', categoryId: phoneCategory.id },
          { name: 'Samsung', description: 'Téléphones Samsung Galaxy', categoryId: phoneCategory.id },
        ],
      })
      console.log('✅ Phone subcategories created')
    } else {
      // Vérifier si toutes les sous-catégories existent
      const hasIPhone = phoneSubCategories.some(sub => sub.name === 'iPhone')
      const hasSamsung = phoneSubCategories.some(sub => sub.name === 'Samsung')
      
      if (!hasIPhone) {
        await prisma.subCategory.create({
          data: { name: 'iPhone', description: 'Téléphones Apple iPhone', categoryId: phoneCategory.id },
        })
        console.log('✅ iPhone subcategory created')
      }
      
      if (!hasSamsung) {
        await prisma.subCategory.create({
          data: { name: 'Samsung', description: 'Téléphones Samsung Galaxy', categoryId: phoneCategory.id },
        })
        console.log('✅ Samsung subcategory created')
      }
    }
  }

  // Catégorie: Ordinateurs
  let computerCategory = await prisma.category.findUnique({
    where: { name: 'Ordinateurs' },
  })
  
  if (!computerCategory) {
    computerCategory = await prisma.category.create({
      data: {
        name: 'Ordinateurs',
        description: 'Ordinateurs portables et de bureau',
        subCategories: {
          create: [
            { name: 'MacBook Air', description: 'MacBook Air Apple' },
            { name: 'MacBook Pro', description: 'MacBook Pro Apple' },
          ],
        },
      },
    })
    console.log('✅ Computer category created with subcategories')
  } else {
    console.log('✅ Computer category already exists')
    // Vérifier et créer les sous-catégories si elles n'existent pas
    const computerSubCategories = await prisma.subCategory.findMany({
      where: { categoryId: computerCategory.id },
    })
    
    if (computerSubCategories.length === 0) {
      await prisma.subCategory.createMany({
        data: [
          { name: 'MacBook Air', description: 'MacBook Air Apple', categoryId: computerCategory.id },
          { name: 'MacBook Pro', description: 'MacBook Pro Apple', categoryId: computerCategory.id },
        ],
      })
      console.log('✅ Computer subcategories created')
    } else {
      // Vérifier si toutes les sous-catégories existent
      const hasMacBookAir = computerSubCategories.some(sub => sub.name === 'MacBook Air')
      const hasMacBookPro = computerSubCategories.some(sub => sub.name === 'MacBook Pro')
      
      if (!hasMacBookAir) {
        await prisma.subCategory.create({
          data: { name: 'MacBook Air', description: 'MacBook Air Apple', categoryId: computerCategory.id },
        })
        console.log('✅ MacBook Air subcategory created')
      }
      
      if (!hasMacBookPro) {
        await prisma.subCategory.create({
          data: { name: 'MacBook Pro', description: 'MacBook Pro Apple', categoryId: computerCategory.id },
        })
        console.log('✅ MacBook Pro subcategory created')
      }
    }
  }

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

