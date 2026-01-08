import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAuth, requireAdmin } from '@/lib/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/exchange-rates - Récupérer les taux de change
export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const exchangeRates = await prisma.exchangeRate.findMany({
        orderBy: {
          date: 'desc',
        },
      })
      return NextResponse.json(exchangeRates, { headers: corsHeaders() })
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exchange rates' },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// POST /api/exchange-rates - Créer un nouveau taux de change (Admin seulement)
export async function POST(request: NextRequest) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
    const { rate, date, isActive } = body

    if (!rate) {
      return NextResponse.json(
        { error: 'Rate is required' },
        { status: 400 }
      )
    }

      // Désactiver les autres taux si celui-ci est actif
      if (isActive) {
        await prisma.exchangeRate.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        })
      }

      const exchangeRate = await prisma.exchangeRate.create({
        data: {
          rate,
          date: date ? new Date(date) : new Date(),
          isActive: isActive !== undefined ? isActive : true,
        },
      })

      return NextResponse.json(exchangeRate, { status: 201, headers: corsHeaders() })
    } catch (error) {
      console.error('Error creating exchange rate:', error)
      return NextResponse.json(
        { error: 'Failed to create exchange rate' },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}


