import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload, rememberMe: boolean = false): string {
  if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Change it in production!')
  }
  
  // Si "Se souvenir de moi" est activé, utiliser l'expiration par défaut (7 jours)
  // Sinon, utiliser une expiration plus courte (1 jour)
  const expiresIn = rememberMe ? JWT_EXPIRES_IN : '1d'
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set!')
      return null
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

