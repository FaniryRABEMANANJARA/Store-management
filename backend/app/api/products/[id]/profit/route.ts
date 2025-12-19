import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET /api/products/[id]/profit - Calculer le bénéfice/perte d'un produit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        purchases: true,
        sales: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculer le coût total (somme de tous les achats)
    const totalCost = product.purchases.reduce(
      (sum, purchase) => sum + purchase.totalCostMGA,
      0
    )

    // Calculer le revenu total (somme de toutes les ventes)
    const totalRevenue = product.sales.reduce(
      (sum, sale) => sum + sale.totalRevenue,
      0
    )

    // Calculer le bénéfice/perte
    const profit = totalRevenue - totalCost

    // Calculer les quantités
    const totalPurchased = product.purchases.reduce(
      (sum, purchase) => sum + purchase.quantity,
      0
    )
    const totalSold = product.sales.reduce(
      (sum, sale) => sum + sale.quantity,
      0
    )
    const stock = totalPurchased - totalSold

    return NextResponse.json({
      productId: product.id,
      productName: product.name,
      totalCost,
      totalRevenue,
      profit,
      totalPurchased,
      totalSold,
      stock,
    })
  } catch (error) {
    console.error('Error calculating profit:', error)
    return NextResponse.json(
      { error: 'Failed to calculate profit' },
      { status: 500 }
    )
  }
}

