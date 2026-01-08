import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { handleCORS, corsHeaders } from '@/lib/cors'
import { requireAdmin } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'
import { handleError } from '@/lib/errorHandler'
import { ValidationError, ConflictError, NotFoundError } from '@/lib/errors'
import { validateRequired, validateEmail, validatePassword, validateRole } from '@/lib/validation'
import { logger } from '@/lib/logger'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

// GET /api/users - Récupérer tous les utilisateurs (Admin seulement)
export async function GET(request: NextRequest) {
  try {
    return await requireAdmin(request, async (req, userId, user) => {
      const prisma = getPrisma()
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      logger.info('Users fetched successfully', { userId, count: users.length })
      return NextResponse.json(users, { headers: corsHeaders() })
    })
  } catch (error: any) {
    return handleError(error, request)
  }
}

// POST /api/users - Créer un nouvel utilisateur (Admin seulement)
export async function POST(request: NextRequest) {
  try {
    return await requireAdmin(request, async (req, userId, user) => {
      const prisma = getPrisma()
      const body = await req.json()
      const { email, name, password, role = 'user' } = body

      // Validation avec le nouveau système
      validateRequired(email, 'Email')
      validateRequired(name, 'Name')
      validateRequired(password, 'Password')
      validateEmail(email)
      validatePassword(password)
      if (role) {
        validateRole(role)
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new ConflictError('User with this email already exists', { email })
      }

      // Hasher le mot de passe
      const hashedPassword = await hashPassword(password)

      // Créer l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logger.info('User created successfully', { 
        userId: user.userId, 
        createdUserId: newUser.id,
        email: newUser.email 
      })

      return NextResponse.json(newUser, { status: 201, headers: corsHeaders() })
    })
  } catch (error: any) {
    return handleError(error, request)
  }
}
