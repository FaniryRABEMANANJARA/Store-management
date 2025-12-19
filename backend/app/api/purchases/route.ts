import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/purchases - Récupérer tous les achats
export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        product: true,
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    })
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

// POST /api/purchases - Créer un nouvel achat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, priceRMB, exchangeRate, purchaseDate } = body

    if (!productId || !quantity || !priceRMB || !exchangeRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
}

