import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAdmin } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/users/[id] - Récupérer un utilisateur par ID (Admin seulement)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const userData = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(userData, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { 
          error: 'Failed to fetch user',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// PUT /api/users/[id] - Mettre à jour un utilisateur (Admin seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      const body = await req.json()
      const { email, name, password, role } = body

      // Vérifier si l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      })

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      // Préparer les données de mise à jour
      const updateData: any = {}
      if (email !== undefined) updateData.email = email
      if (name !== undefined) updateData.name = name
      if (role !== undefined) updateData.role = role
      if (password !== undefined && password.trim() !== '') {
        updateData.password = await hashPassword(password)
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        })
        if (emailExists) {
          return NextResponse.json(
            { error: 'Email already in use by another user' },
            { status: 400, headers: corsHeaders() }
          )
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return NextResponse.json(updatedUser, { headers: corsHeaders() })
    } catch (error: any) {
      console.error('Error updating user:', error)
      
      // Gérer les erreurs de contrainte unique
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400, headers: corsHeaders() }
        )
      }

      // Gérer les erreurs d'utilisateur non trouvé
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to update user',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}

// DELETE /api/users/[id] - Supprimer un utilisateur (Admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAdmin(request, async (req, userId, user) => {
    try {
      const prisma = getPrisma()
      
      // Empêcher la suppression de soi-même
      if (params.id === userId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400, headers: corsHeaders() }
        )
      }

      // Vérifier si l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
      })

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      await prisma.user.delete({
        where: { id: params.id },
      })

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { headers: corsHeaders() }
      )
    } catch (error: any) {
      console.error('Error deleting user:', error)
      
      // Gérer les erreurs d'utilisateur non trouvé
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404, headers: corsHeaders() }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to delete user',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: error.code
        },
        { status: 500, headers: corsHeaders() }
      )
    }
  })
}
