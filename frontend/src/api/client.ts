import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Product {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
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
export const productsApi = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<Product>('/products', data),
  update: (id: string, data: { name: string; description?: string }) =>
    apiClient.put<Product>(`/products/${id}`, data),
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
}

export const exchangeRatesApi = {
  getAll: () => apiClient.get<ExchangeRate[]>('/exchange-rates'),
  create: (data: { rate: number; date?: string; isActive?: boolean }) =>
    apiClient.post<ExchangeRate>('/exchange-rates', data),
  getActive: () => apiClient.get<ExchangeRate>('/exchange-rates/active'),
}

