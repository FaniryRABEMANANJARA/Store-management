import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/products - Récupérer tous les produits
export async function GET() {
  try {
    const prisma = getPrisma()
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
        purchases: true,
        sales: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(products, { headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const body = await request.json()
    const { 
      name, 
      description, 
      categoryId, 
      subCategoryId,
      color,
      storage,
      model,
      battery,
      simType,
      condition,
      ram,
      processor,
      screenSize,
      graphics
    } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and categoryId are required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        categoryId,
        subCategoryId: subCategoryId || null,
        color: color || null,
        storage: storage || null,
        model: model || null,
        battery: battery || null,
        simType: simType || null,
        condition: condition || null,
        ram: ram || null,
        processor: processor || null,
        screenSize: screenSize || null,
        graphics: graphics || null,
      },
      include: {
        category: true,
        subCategory: true,
      },
    })

    return NextResponse.json(product, { status: 201, headers: corsHeaders() })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

