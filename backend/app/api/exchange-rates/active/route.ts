import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/exchange-rates/active - Récupérer le taux de change actif
export async function GET() {
  try {
    const activeRate = await prisma.exchangeRate.findFirst({
      where: { isActive: true },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(activeRate)
  } catch (error) {
    console.error('Error fetching active exchange rate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch active exchange rate' },
      { status: 500 }
    )
  }
}

