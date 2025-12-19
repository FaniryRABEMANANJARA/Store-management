import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/orders - Récupérer toutes les commandes
export async function GET() {
  try {
    const prisma = getPrisma()
    
    // Vérifier que le modèle Order existe dans Prisma Client
    if (!prisma.order) {
      console.error('❌ Prisma Client does not have Order model. Please regenerate Prisma Client: yarn prisma generate')
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
    
    const orders = await prisma.order.findMany({
      include: {
        product: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    })
    return NextResponse.json(orders, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

// POST /api/orders - Créer une nouvelle commande
export async function POST(request: NextRequest) {
  try {
    const prisma = getPrisma()
    
    // Vérifier que le modèle Order existe dans Prisma Client
    if (!prisma.order) {
      console.error('❌ Prisma Client does not have Order model. Please regenerate Prisma Client: yarn prisma generate')
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
    const { productId, quantity, priceRMB, exchangeRate, orderDate } = body

    if (!productId || !quantity || !priceRMB || !exchangeRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: corsHeaders(),
        }
      )
    }

    // Calculer le coût total en MGA
    const totalCostMGA = priceRMB * exchangeRate * quantity

    const order = await prisma.order.create({
      data: {
        productId,
        quantity,
        priceRMB,
        exchangeRate,
        totalCostMGA,
        status: 'pending',
        orderDate: orderDate ? new Date(orderDate) : new Date(),
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(order, { 
      status: 201,
      headers: corsHeaders(),
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

