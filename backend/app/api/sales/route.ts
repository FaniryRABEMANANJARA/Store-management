import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/sales - Récupérer toutes les ventes
export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        product: true,
      },
      orderBy: {
        saleDate: 'desc',
      },
    })
    return NextResponse.json(sales, { headers: corsHeaders() })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST /api/sales - Créer une nouvelle vente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, priceMGA, saleDate } = body

    if (!productId || !quantity || !priceMGA) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400, headers: corsHeaders() }
    )
    }

    // Calculer le revenu total
    const totalRevenue = priceMGA * quantity

    const sale = await prisma.sale.create({
      data: {
        productId,
        quantity,
        priceMGA,
        totalRevenue,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(sale, { status: 201, headers: corsHeaders() })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

