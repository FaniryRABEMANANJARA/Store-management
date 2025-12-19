import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { handleCORS, corsHeaders } from '@/lib/cors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Gérer les requêtes OPTIONS (preflight CORS)
export async function OPTIONS() {
  return handleCORS()
}

export async function POST(request: NextRequest) {
  try {
    // Obtenir Prisma Client (garantit l'initialisation)
    const prisma = getPrisma()

    const body = await request.json()
    const { email, password, name, rememberMe } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Valider la longueur du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'user',
      },
    })

    // Générer le token avec ou sans "Se souvenir de moi"
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    }, rememberMe === true)

    // Retourner l'utilisateur (sans le mot de passe) et le token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { 
        status: 201,
        headers: corsHeaders(),
      }
    )
  } catch (error: any) {
    console.error('Error registering user:', error)
    
    // Retourner plus de détails en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Failed to register user'
      : 'Failed to register user'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { 
        status: 500,
        headers: corsHeaders(),
      }
    )
  }
}

