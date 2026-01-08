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

// GET /api/subcategories/[id] - Récupérer une sous-catégorie par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
    })

    if (!subCategory) {
      return NextResponse.json(
        { error: 'SubCategory not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

      return NextResponse.json(subCategory, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error fetching subcategory:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch subcategory',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// PUT /api/subcategories/[id] - Mettre à jour une sous-catégorie (Admin seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
    const { name, description, categoryId } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const subCategory = await prisma.subCategory.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        categoryId: categoryId || undefined,
      },
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
    })

      return NextResponse.json(subCategory, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error updating subcategory:', error)
      
      // Gérer les erreurs de contrainte unique
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Subcategory with this name already exists in this category' },
          { status: 400, headers: corsHeaders() }
        )
      }

      // Gérer les erreurs de sous-catégorie non trouvée
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'SubCategory not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to update subcategory',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// DELETE /api/subcategories/[id] - Supprimer une sous-catégorie (Admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
    
    // Vérifier si la sous-catégorie existe et a des produits
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!subCategory) {
      return NextResponse.json(
        { error: 'SubCategory not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    // Note: Les produits avec cette sous-catégorie auront subCategoryId = null (onDelete: SetNull)
    await prisma.subCategory.delete({
      where: { id: params.id },
    })

      return NextResponse.json(
        { message: 'SubCategory deleted successfully' },
        { headers: corsHeaders() }
      )
    } catch (error: any) {
      console.error('Error deleting subcategory:', error)
      
      // Gérer les erreurs de sous-catégorie non trouvée
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'SubCategory not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to delete subcategory',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

