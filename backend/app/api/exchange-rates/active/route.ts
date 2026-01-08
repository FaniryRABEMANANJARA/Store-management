import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAuth } from '@/lib/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/exchange-rates/active - Récupérer le taux de change actif
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
    const activeRate = await prisma.exchangeRate.findFirst({
      where: { isActive: true },
      orderBy: { date: 'desc' },
    })
      return NextResponse.json(activeRate, {
        headers: corsHeaders(),
      })
    } catch (error) {
      console.error('Error fetching active exchange rate:', error)
      return NextResponse.json(
        { error: 'Failed to fetch active exchange rate' },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      )
    }
  })
}

