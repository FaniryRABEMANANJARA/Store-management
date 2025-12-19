import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

export async function POST(request: NextRequest) {
  try {
    // Obtenir Prisma Client (garantit l'initialisation)
    const prisma = getPrisma()
    
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Générer le token avec ou sans "Se souvenir de moi"
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, rememberMe === true)

    // Retourner l'utilisateur (sans le mot de passe) et le token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    }, {
      headers: corsHeaders(),
    })
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

