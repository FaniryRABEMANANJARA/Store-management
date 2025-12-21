import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/categories - Récupérer toutes les catégories
export async function GET() {
  try {
    const prisma = getPrisma()
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(categories, { headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const body = await request.json()
    const { name, description, fieldConfig } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        fieldConfig: fieldConfig || null,
      },
      include: {
        subCategories: true,
      },
    })

    return NextResponse.json(category, { status: 201, headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create category',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

