import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma()
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        subCategory: true,
        purchases: {
          orderBy: { purchaseDate: 'desc' },
        },
        sales: {
          orderBy: { saleDate: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        categoryId: categoryId || undefined,
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

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma()
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

