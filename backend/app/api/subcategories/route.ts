import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/subcategories - Récupérer toutes les sous-catégories
export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const where = categoryId ? { categoryId } : {}

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(subCategories, { headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch subcategories',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST /api/subcategories - Créer une nouvelle sous-catégorie
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const body = await request.json()
    const { name, description, categoryId } = body

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and categoryId are required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        description: description || null,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(subCategory, { status: 201, headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error creating subcategory:', error)
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Subcategory with this name already exists in this category' },
        { status: 400, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

