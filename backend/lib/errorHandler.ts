/**
 * Middleware de gestion d'erreur global
 * Capture et formate toutes les erreurs de manière cohérente
 */

import { NextRequest, NextResponse } from 'next/server'
import { AppError, formatErrorResponse, mapPrismaError } from './errors'
import { logger } from './logger'
import { corsHeaders } from './cors'

/**
 * Wrapper pour les handlers de route qui gère automatiquement les erreurs
 */
export function withErrorHandler<T = any>(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const response = await handler(request, ...args)
      return response
    } catch (error: any) {
      return handleError(error, request)
    }
  }
}

/**
 * Gère les erreurs et retourne une réponse formatée
 */
export function handleError(
  error: any,
  request?: NextRequest
): NextResponse {
  const path = request?.url ? new URL(request.url).pathname : undefined
  const method = request?.method || 'UNKNOWN'

  // Si c'est déjà une AppError, l'utiliser directement
  if (error instanceof AppError) {
    logger.logApiError(path || 'unknown', error, undefined, {
      code: error.code,
      statusCode: error.statusCode,
    })

    const errorResponse = formatErrorResponse(error, path)
    return NextResponse.json(errorResponse, {
      status: error.statusCode,
      headers: corsHeaders(),
    })
  }

  // Si c'est une erreur Prisma, la mapper
  if (error.code && error.code.startsWith('P')) {
    const appError = mapPrismaError(error)
    logger.logApiError(path || 'unknown', appError, undefined, {
      code: appError.code,
      statusCode: appError.statusCode,
      prismaCode: error.code,
    })

    const errorResponse = formatErrorResponse(appError, path)
    return NextResponse.json(errorResponse, {
      status: appError.statusCode,
      headers: corsHeaders(),
    })
  }

  // Erreur inconnue - logger avec tous les détails
  logger.error(
    `Unhandled error: ${method} ${path || 'unknown'}`,
    error instanceof Error ? error : new Error(String(error)),
    {
      path,
      method,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
  )

  // En production, ne pas exposer les détails de l'erreur
  const errorResponse = formatErrorResponse(
    error instanceof Error ? error : new Error('Internal server error'),
    path
  )

  return NextResponse.json(errorResponse, {
    status: 500,
    headers: corsHeaders(),
  })
}

/**
 * Middleware pour wrapper les routes avec gestion d'erreur
 * Usage: export const GET = withErrorHandler(async (request) => { ... })
 */
export function asyncHandler(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withErrorHandler(handler)
}
