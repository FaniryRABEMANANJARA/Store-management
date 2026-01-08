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

// DELETE /api/sales/[id] - Supprimer/Annuler une vente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuth(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      
      await prisma.sale.delete({
        where: { id: params.id },
      })

      return NextResponse.json({ success: true }, {
        headers: corsHeaders(),
      })
    } catch (error: any) {
      console.error('Error deleting sale:', error)
      return NextResponse.json(
        { error: 'Failed to delete sale' },
        { 
          status: 500,
          headers: corsHeaders(),
        }
      )
    }
  })
}

