import axios from 'axios'

// En développement, utiliser le proxy Vite (/api)
// En production, utiliser VITE_API_URL si défini, sinon utiliser une URL relative
// Le proxy Vite redirige automatiquement vers le backend (port 3000 ou autre)
const getApiUrl = () => {
  // Si VITE_API_URL est défini, l'utiliser (pour production avec backend séparé)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // En développement, utiliser le proxy Vite
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // En production sans VITE_API_URL, utiliser une URL relative
  // Cela fonctionne si le frontend et le backend sont sur le même domaine
  // Sinon, il faut configurer VITE_API_URL dans Vercel
  return '/api'
}

const API_URL = getApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - nettoyer les deux types de stockage
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      delete apiClient.defaults.headers.common['Authorization']
      // Rediriger vers login si on n'est pas déjà sur la page de login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface Category {
  id: string
  name: string
  description?: string
  fieldConfig?: any[] // Configuration JSON des champs dynamiques
  createdAt: string
  updatedAt: string
  subCategories?: SubCategory[]
  _count?: {
    products: number
  }
}

export interface SubCategory {
  id: string
  name: string
  description?: string
  categoryId: string
  createdAt: string
  updatedAt: string
  category?: Category
  _count?: {
    products: number
  }
}

export interface Product {
  id: string
  name: string
  description?: string
  categoryId: string
  subCategoryId?: string
  color?: string
  storage?: string
  model?: string
  battery?: string
  simType?: string // "dual_sim", "esim", "dual_sim_esim"
  condition?: string // "new", "refurbished", "used", "like_new"
  // Attributs spécifiques aux ordinateurs
  ram?: string
  processor?: string
  screenSize?: string
  graphics?: string
  createdAt: string
  updatedAt: string
  category?: Category
  subCategory?: SubCategory
}

export interface Purchase {
  id: string
  productId: string
  quantity: number
  priceRMB: number
  exchangeRate: number
  totalCostMGA: number
  purchaseDate: string
  product?: Product
}

export interface Sale {
  id: string
  productId: string
  quantity: number
  priceMGA: number
  totalRevenue: number
  saleDate: string
  product?: Product
}

export interface ExchangeRate {
  id: string
  rate: number
  date: string
  isActive: boolean
}

export interface Order {
  id: string
  productId: string
  quantity: number
  priceRMB: number
  exchangeRate: number
  totalCostMGA: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  orderDate: string
  createdAt: string
  updatedAt: string
  product?: Product
}

export interface Profit {
  productId: string
  productName: string
  totalCost: number
  totalRevenue: number
  profit: number
  totalPurchased: number
  totalSold: number
  stock: number
}

// API functions
export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),
  create: (data: { name: string; description?: string; fieldConfig?: any[] }) =>
    apiClient.post<Category>('/categories', data),
  update: (id: string, data: { name: string; description?: string; fieldConfig?: any[] }) =>
    apiClient.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
}

export const subCategoriesApi = {
  getAll: (categoryId?: string) => {
    const params = categoryId ? { params: { categoryId } } : {}
    return apiClient.get<SubCategory[]>('/subcategories', params)
  },
  getById: (id: string) => apiClient.get<SubCategory>(`/subcategories/${id}`),
  create: (data: { name: string; description?: string; categoryId: string }) =>
    apiClient.post<SubCategory>('/subcategories', data),
  update: (id: string, data: { name: string; description?: string; categoryId?: string }) =>
    apiClient.put<SubCategory>(`/subcategories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/subcategories/${id}`),
}

export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (data: {
    name: string
    description?: string
    categoryId: string
    subCategoryId?: string
    color?: string
    storage?: string
    model?: string
    battery?: string
    simType?: string
    condition?: string
    ram?: string
    processor?: string
    screenSize?: string
    graphics?: string
  }) => apiClient.post<Product>('/products', data),
  update: (id: string, data: {
    name: string
    description?: string
    categoryId?: string
    subCategoryId?: string
    color?: string
    storage?: string
    model?: string
    battery?: string
    simType?: string
    condition?: string
    ram?: string
    processor?: string
    screenSize?: string
    graphics?: string
  }) => apiClient.put<Product>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  getProfit: (id: string) => apiClient.get<Profit>(`/products/${id}/profit`),
}

export const purchasesApi = {
  getAll: () => apiClient.get<Purchase[]>('/purchases'),
  create: (data: {
    productId: string
    quantity: number
    priceRMB: number
    exchangeRate: number
    purchaseDate?: string
  }) => apiClient.post<Purchase>('/purchases', data),
}

export const salesApi = {
  getAll: () => apiClient.get<Sale[]>('/sales'),
  create: (data: {
    productId: string
    quantity: number
    priceMGA: number
    saleDate?: string
  }) => apiClient.post<Sale>('/sales', data),
  delete: (id: string) => apiClient.delete(`/sales/${id}`),
}

export const exchangeRatesApi = {
  getAll: () => apiClient.get<ExchangeRate[]>('/exchange-rates'),
  create: (data: { rate: number; date?: string; isActive?: boolean }) =>
    apiClient.post<ExchangeRate>('/exchange-rates', data),
  getActive: () => apiClient.get<ExchangeRate | null>('/exchange-rates/active'),
}

export const ordersApi = {
  getAll: () => apiClient.get<Order[]>('/orders'),
  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: (data: {
    productId: string
    quantity: number
    priceRMB: number
    exchangeRate: number
    orderDate?: string
  }) => apiClient.post<Order>('/orders', data),
  update: (id: string, data: Partial<Order>) => apiClient.put<Order>(`/orders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
}

