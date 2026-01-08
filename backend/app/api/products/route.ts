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

// GET /api/products - Récupérer les produits avec pagination
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const { page, limit, sortBy, sortOrder } = parsePaginationParams(req)
      
      // Générer une clé de cache
      const cacheKey = cache.generateKey('products', {
        page,
        limit,
        sortBy: sortBy || 'createdAt',
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
        orderBy.createdAt = sortOrder
      }
      
      // Récupérer les données avec pagination
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          include: {
            category: true,
            subCategory: true,
            // Ne pas inclure purchases et sales pour améliorer les performances
            // Ils peuvent être chargés séparément si nécessaire
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.product.count(),
      ])
      
      // Créer le résultat paginé
      const result = createPaginationResult(products, total, page, limit)
      
      // Mettre en cache (TTL de 2 minutes pour les produits)
      cache.set(cacheKey, result, 2 * 60 * 1000)
      
      return NextResponse.json(result, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch products',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
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

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and categoryId are required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        categoryId,
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

      // Invalider le cache des produits
      cache.deleteByPrefix('products')
      
      return NextResponse.json(product, { status: 201, headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create product',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

