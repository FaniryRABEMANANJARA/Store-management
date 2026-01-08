import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAuth } from '@/lib/middleware'
import { parsePaginationParams, createPaginationResult } from '@/lib/pagination'
import { cache } from '@/lib/cache'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/purchases - Récupérer les achats avec pagination
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const { page, limit, sortBy, sortOrder } = parsePaginationParams(req)
      
      // Générer une clé de cache
      const cacheKey = cache.generateKey('purchases', {
        page,
        limit,
        sortBy: sortBy || 'purchaseDate',
        sortOrder,
      })
      
      // Vérifier le cache
      const cached = cache.get<any>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, { headers: corsHeaders() })
      }
      
      // Calculer le skip
      const skip = (page - 1) * limit
      
      // Construire l'orderBy
      const orderBy: any = {}
      if (sortBy) {
        orderBy[sortBy] = sortOrder
      } else {
        orderBy.purchaseDate = sortOrder
      }
      
      // Récupérer les données avec pagination
      const [purchases, total] = await Promise.all([
        prisma.purchase.findMany({
          include: {
            product: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.purchase.count(),
      ])
      
      // Créer le résultat paginé
      const result = createPaginationResult(purchases, total, page, limit)
      
      // Mettre en cache (TTL de 1 minute pour les achats)
      cache.set(cacheKey, result, 60 * 1000)
      
      return NextResponse.json(result, { headers: corsHeaders() })
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
  })
}

// POST /api/purchases - Créer un nouvel achat
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
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

      // Invalider le cache des achats
      cache.deleteByPrefix('purchases')
      
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
  })
}

