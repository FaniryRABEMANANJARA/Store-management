import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/purchases - Récupérer tous les achats
export async function GET() {
  try {
    const prisma = getPrisma()
    const purchases = await prisma.purchase.findMany({
      include: {
        product: true,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    })
    return NextResponse.json(purchases, { headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch purchases',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// POST /api/purchases - Créer un nouvel achat
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma()
    const body = await request.json()
    const { productId, quantity, priceRMB, exchangeRate, purchaseDate } = body

    if (!productId || !quantity || !priceRMB || !exchangeRate) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400, headers: corsHeaders() }
    )
    }

    // Calculer le coût total en MGA
    const totalCostMGA = priceRMB * exchangeRate * quantity

    const purchase = await prisma.purchase.create({
      data: {
        productId,
        quantity,
        priceRMB,
        exchangeRate,
        totalCostMGA,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(purchase, { status: 201, headers: corsHeaders() })
  } catch (error: any) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create purchase',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

