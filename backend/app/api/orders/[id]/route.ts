import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/orders/[id] - Récupérer une commande par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma()
    
    if (!prisma.order) {
      return NextResponse.json(
        { 
          error: 'Order model not found in Prisma Client',
          details: 'Please restart the backend server after running: yarn prisma generate'
        },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      )
    }
    
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        product: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { 
          status: 404,
          headers: corsHeaders(),
        }
      )
    }

    return NextResponse.json(order, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

// PUT /api/orders/[id] - Mettre à jour une commande
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma()
    
    if (!prisma.order) {
      return NextResponse.json(
        { 
          error: 'Order model not found in Prisma Client',
          details: 'Please restart the backend server after running: yarn prisma generate'
        },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      )
    }
    
    const body = await request.json()
    const { productId, quantity, priceRMB, exchangeRate, status, orderDate } = body

    // Recalculer le coût total si les valeurs changent
    let totalCostMGA = undefined
    if (priceRMB !== undefined && exchangeRate !== undefined && quantity !== undefined) {
      totalCostMGA = priceRMB * exchangeRate * quantity
    }

    const updateData: any = {}
    if (productId !== undefined) updateData.productId = productId
    if (quantity !== undefined) updateData.quantity = quantity
    if (priceRMB !== undefined) updateData.priceRMB = priceRMB
    if (exchangeRate !== undefined) updateData.exchangeRate = exchangeRate
    if (status !== undefined) updateData.status = status
    if (orderDate !== undefined) updateData.orderDate = new Date(orderDate)
    if (totalCostMGA !== undefined) updateData.totalCostMGA = totalCostMGA

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        product: true,
      },
    })

    return NextResponse.json(order, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

// DELETE /api/orders/[id] - Supprimer une commande
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getPrisma()
    
    if (!prisma.order) {
      return NextResponse.json(
        { 
          error: 'Order model not found in Prisma Client',
          details: 'Please restart the backend server after running: yarn prisma generate'
        },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      )
    }
    
    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

