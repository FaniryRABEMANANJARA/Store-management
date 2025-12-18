import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/exchange-rates - Récupérer les taux de change
export async function GET() {
  try {
    const exchangeRates = await prisma.exchangeRate.findMany({
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(exchangeRates)
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}

// POST /api/exchange-rates - Créer un nouveau taux de change
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    return NextResponse.json(exchangeRate, { status: 201 })
  } catch (error) {
    console.error('Error creating exchange rate:', error)
    return NextResponse.json(
      { error: 'Failed to create exchange rate' },
      { status: 500 }
    )
  }
}


