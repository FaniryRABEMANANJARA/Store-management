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

// GET /api/sales - Récupérer les ventes avec pagination
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const { page, limit, sortBy, sortOrder } = parsePaginationParams(req)
      
      // Générer une clé de cache
      const cacheKey = cache.generateKey('sales', {
        page,
        limit,
        sortBy: sortBy || 'saleDate',
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
        orderBy.saleDate = sortOrder
      }
      
      // Récupérer les données avec pagination
      const [sales, total] = await Promise.all([
        prisma.sale.findMany({
          include: {
            product: true,
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.sale.count(),
      ])
      
      // Créer le résultat paginé
      const result = createPaginationResult(sales, total, page, limit)
      
      // Mettre en cache (TTL de 1 minute pour les ventes)
      cache.set(cacheKey, result, 60 * 1000)
      
      return NextResponse.json(result, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error fetching sales:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch sales',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// POST /api/sales - Créer une nouvelle vente
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
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

      // Invalider le cache des ventes
      cache.deleteByPrefix('sales')
      
      return NextResponse.json(sale, { status: 201, headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error creating sale:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create sale',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

