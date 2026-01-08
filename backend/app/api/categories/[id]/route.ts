import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAuth, requireAdmin } from '@/lib/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/categories/[id] - Récupérer une catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

      return NextResponse.json(category, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error fetching category:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch category',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// PUT /api/categories/[id] - Mettre à jour une catégorie (Admin seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
    const { name, description, fieldConfig } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        fieldConfig: fieldConfig || null,
      },
      include: {
        subCategories: {
          orderBy: { name: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    })

      return NextResponse.json(category, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error updating category:', error)
      
      // Gérer les erreurs de contrainte unique
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400, headers: corsHeaders() }
        )
      }

      // Gérer les erreurs de catégorie non trouvée
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to update category',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// DELETE /api/categories/[id] - Supprimer une catégorie (Admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
    
    // Vérifier si la catégorie existe et a des produits
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    // Vérifier si la catégorie a des produits (onDelete: Restrict dans le schéma)
    if (category._count.products > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated products',
          productCount: category._count.products
        },
        { status: 400, headers: corsHeaders() }
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

      return NextResponse.json(
        { message: 'Category deleted successfully' },
        { headers: corsHeaders() }
      )
    } catch (error: any) {
      console.error('Error deleting category:', error)
      
      // Gérer les erreurs de contrainte (produits associés)
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Cannot delete category with associated products' },
          { status: 400, headers: corsHeaders() }
        )
      }

      // Gérer les erreurs de catégorie non trouvée
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to delete category',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

