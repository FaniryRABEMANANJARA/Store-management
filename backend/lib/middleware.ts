import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './auth'
import { getPrisma } from './prisma'
import { corsHeaders } from './cors'
import { AuthenticationError, AuthorizationError } from './errors'
import { logger } from './logger'

export interface AuthenticatedUser extends JWTPayload {
  userId: string
  email: string
  role: string
}

export function authenticate(request: NextRequest): AuthenticatedUser | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (!payload) {
    return null
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  }
}

/**
 * Middleware pour exiger une authentification
 * @param request - La requête Next.js
 * @param handler - Le handler de la route avec userId et user
 */
export function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string, user: AuthenticatedUser) => Promise<NextResponse>
) {
  const user = authenticate(request)

  if (!user) {
    logger.warn('Unauthorized access attempt', {
      path: new URL(request.url).pathname,
      method: request.method,
    })
    throw new AuthenticationError('Authentication required')
  }

  return handler(request, user.userId, user)
}

/**
 * Middleware pour exiger un rôle spécifique (admin)
 * @param request - La requête Next.js
 * @param handler - Le handler de la route avec userId et user
 */
export function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, userId: string, user: AuthenticatedUser) => Promise<NextResponse>
) {
  const user = authenticate(request)

  if (!user) {
    logger.warn('Unauthorized access attempt', {
      path: new URL(request.url).pathname,
      method: request.method,
    })
    throw new AuthenticationError('Authentication required')
  }

  if (user.role !== 'admin') {
    logger.warn('Forbidden access attempt', {
      path: new URL(request.url).pathname,
      method: request.method,
      userId: user.userId,
      role: user.role,
    })
    throw new AuthorizationError('Admin access required')
  }

  return handler(request, user.userId, user)
}

/**
 * Middleware pour exiger un rôle spécifique (personnalisable)
 * @param allowedRoles - Les rôles autorisés
 * @param request - La requête Next.js
 * @param handler - Le handler de la route avec userId et user
 */
export function requireRole(
  allowedRoles: string[],
  request: NextRequest,
  handler: (request: NextRequest, userId: string, user: AuthenticatedUser) => Promise<NextResponse>
) {
  const user = authenticate(request)

  if (!user) {
    logger.warn('Unauthorized access attempt', {
      path: new URL(request.url).pathname,
      method: request.method,
    })
    throw new AuthenticationError('Authentication required')
  }

  if (!allowedRoles.includes(user.role)) {
    logger.warn('Forbidden access attempt - insufficient role', {
      path: new URL(request.url).pathname,
      method: request.method,
      userId: user.userId,
      userRole: user.role,
      requiredRoles: allowedRoles,
    })
    throw new AuthorizationError(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
  }

  return handler(request, user.userId, user)
}

/**
 * Récupère les informations complètes de l'utilisateur depuis la base de données
 * Utile pour vérifier les permissions à jour
 */
export async function getUserFromDB(userId: string) {
  const prisma = getPrisma()
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

