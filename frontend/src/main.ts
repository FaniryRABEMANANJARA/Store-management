import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import './style.css'

import ProductsView from './views/ProductsView.vue'
import PurchasesView from './views/PurchasesView.vue'
import SalesView from './views/SalesView.vue'
import DashboardView from './views/DashboardView.vue'
import CategoriesView from './views/CategoriesView.vue'
import BudgetView from './views/BudgetView.vue'
import OrdersView from './views/OrdersView.vue'
import UsersView from './views/UsersView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import { useAuth } from './composables/useAuth'

const routes = [
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { requiresAuth: false }
  },
  { 
    path: '/register', 
    name: 'register', 
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  { 
    path: '/', 
    name: 'dashboard', 
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/products', 
    component: ProductsView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/categories', 
    component: CategoriesView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/budget', 
    component: BudgetView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/orders', 
    component: OrdersView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/purchases', 
    component: PurchasesView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/sales', 
    component: SalesView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/users', 
    component: UsersView,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, fetchUser, user } = useAuth()
  
  // Si on a un token, récupérer les infos utilisateur
  if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
    if (!isAuthenticated.value) {
      await fetchUser()
    }
  }

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    if (isAuthenticated.value) {
      // Vérifier si la route nécessite un rôle spécifique
      if (to.meta.requiresRole) {
        const userRole = user.value?.role || 'user'
        const requiredRoles = Array.isArray(to.meta.requiresRole) 
          ? to.meta.requiresRole 
          : [to.meta.requiresRole]
        
        if (!requiredRoles.includes(userRole)) {
          // Rediriger vers une page d'accès refusé ou le dashboard
          next('/')
          return
        }
      }
      next()
    } else {
      next('/login')
    }
  } else {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
      next('/')
    } else {
      next()
    }
  }
})

createApp(App).use(router).use(vuetify).mount('#app')

