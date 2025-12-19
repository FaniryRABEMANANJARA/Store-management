import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/exchange-rates/active - Récupérer le taux de change actif
export async function GET() {
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
}

