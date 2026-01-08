import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '../api/client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
}

const user = ref<User | null>(null)
// Charger le token depuis localStorage (persistant) ou sessionStorage (temporaire)
const token = ref<string | null>(
  localStorage.getItem('token') || sessionStorage.getItem('token')
)

// Configurer le token dans axios si disponible
if (token.value) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
}

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  async function login(email: string, password: string, rememberMe: boolean = false) {
    try {
      const response = await apiClient.post('/auth/login', { email, password, rememberMe })
      const { user: userData, token: tokenData } = response.data

      user.value = userData
      token.value = tokenData
      
      // Si "Se souvenir de moi" est activé, utiliser localStorage (persistant)
      // Sinon, utiliser sessionStorage (temporaire, se vide à la fermeture du navigateur)
      if (rememberMe) {
        localStorage.setItem('token', tokenData)
        sessionStorage.removeItem('token') // Nettoyer sessionStorage si on passe à localStorage
      } else {
        sessionStorage.setItem('token', tokenData)
        localStorage.removeItem('token') // Nettoyer localStorage si on passe à sessionStorage
      }
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors de la connexion',
      }
    }
  }

  async function register(name: string, email: string, password: string, rememberMe: boolean = false) {
    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        rememberMe,
      })
      const { user: userData, token: tokenData } = response.data

      user.value = userData
      token.value = tokenData
      
      // Si "Se souvenir de moi" est activé, utiliser localStorage (persistant)
      // Sinon, utiliser sessionStorage (temporaire)
      if (rememberMe) {
        localStorage.setItem('token', tokenData)
        sessionStorage.removeItem('token')
      } else {
        sessionStorage.setItem('token', tokenData)
        localStorage.removeItem('token')
      }
      
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`

      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de l\'inscription'
      const errorDetails = error.response?.data?.details
      
      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
      }
    }
  }

  async function logout() {
    user.value = null
    token.value = null
    // Nettoyer les deux types de stockage
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    delete apiClient.defaults.headers.common['Authorization']
    router.push('/login')
  }

  async function fetchUser() {
    if (!token.value) {
      return
    }

    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data
    } catch (error) {
      // Token invalide, déconnecter l'utilisateur
      logout()
    }
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')
  
  const hasRole = (role: string) => {
    return user.value?.role === role
  }
  
  const hasAnyRole = (roles: string[]) => {
    return user.value ? roles.includes(user.value.role) : false
  }

  return {
    user: computed(() => user.value),
    isAuthenticated,
    isAdmin,
    isUser,
    hasRole,
    hasAnyRole,
    login,
    register,
    logout,
    fetchUser,
  }
}

