/**
 * Système de gestion d'erreur centralisé
 * Fournit des codes d'erreur standardisés et des messages cohérents
 */

export enum ErrorCode {
  // Erreurs d'authentification (1000-1099)
  UNAUTHORIZED = 'AUTH_001',
  FORBIDDEN = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  INVALID_CREDENTIALS = 'AUTH_004',
  
  // Erreurs de validation (2000-2099)
  VALIDATION_ERROR = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  INVALID_EMAIL = 'VAL_003',
  INVALID_PASSWORD = 'VAL_004',
  INVALID_INPUT = 'VAL_005',
  
  // Erreurs de ressources (3000-3099)
  NOT_FOUND = 'RES_001',
  ALREADY_EXISTS = 'RES_002',
  RESOURCE_CONFLICT = 'RES_003',
  
  // Erreurs de base de données (4000-4099)
  DATABASE_ERROR = 'DB_001',
  UNIQUE_CONSTRAINT = 'DB_002',
  FOREIGN_KEY_CONSTRAINT = 'DB_003',
  RECORD_NOT_FOUND = 'DB_004',
  
  // Erreurs serveur (5000-5099)
  INTERNAL_ERROR = 'SRV_001',
  SERVICE_UNAVAILABLE = 'SRV_002',
  TIMEOUT = 'SRV_003',
  
  // Erreurs métier (6000-6099)
  BUSINESS_RULE_VIOLATION = 'BIZ_001',
  INSUFFICIENT_PERMISSIONS = 'BIZ_002',
  OPERATION_NOT_ALLOWED = 'BIZ_003',
}

export interface AppError extends Error {
  code: ErrorCode
  statusCode: number
  details?: any
  isOperational?: boolean
}

export class AppError extends Error implements AppError {
  code: ErrorCode
  statusCode: number
  details?: any
  isOperational?: boolean

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational
    
    // Maintenir la stack trace pour le debugging
    Error.captureStackTrace(this, this.constructor)
  }
}

// Classes d'erreur spécialisées
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden', details?: any) {
    super(ErrorCode.FORBIDDEN, message, 403, details)
    this.name = 'AuthorizationError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404, details)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', details?: any) {
    super(ErrorCode.ALREADY_EXISTS, message, 409, details)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details)
    this.name = 'DatabaseError'
  }
}

// Mapping des codes Prisma vers nos codes d'erreur
export function mapPrismaError(error: any): AppError {
  // Erreur de contrainte unique (P2002)
  if (error.code === 'P2002') {
    const target = error.meta?.target || []
    const field = Array.isArray(target) ? target.join(', ') : 'field'
    return new ConflictError(
      `A record with this ${field} already exists`,
      { field, code: error.code }
    )
  }

  // Erreur de clé étrangère (P2003)
  if (error.code === 'P2003') {
    return new ValidationError(
      'Foreign key constraint violation',
      { code: error.code, field: error.meta?.field_name }
    )
  }

  // Enregistrement non trouvé (P2025)
  if (error.code === 'P2025') {
    return new NotFoundError('Record', { code: error.code })
  }

  // Erreur de connexion à la base de données
  if (error.code === 'P1001' || error.code === 'P1002') {
    return new DatabaseError(
      'Database connection error',
      { code: error.code }
    )
  }

  // Erreur générique de base de données
  return new DatabaseError(
    error.message || 'Database operation failed',
    { code: error.code, meta: error.meta }
  )
}

// Format standardisé de réponse d'erreur
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    path?: string
  }
}

export function formatErrorResponse(
  error: AppError | Error,
  path?: string
): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }

  // Erreur non opérationnelle (erreur système)
  return {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal error occurred' 
        : error.message,
      details: process.env.NODE_ENV === 'development' 
        ? { stack: error.stack } 
        : undefined,
      timestamp: new Date().toISOString(),
      path,
    },
  }
}
