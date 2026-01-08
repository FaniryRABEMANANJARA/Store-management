import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAuth, getUserFromDB } from '@/lib/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      // Récupérer les informations complètes de l'utilisateur depuis la DB
      const userData = await getUserFromDB(userId)

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(userData, { headers: corsHeaders() })
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

