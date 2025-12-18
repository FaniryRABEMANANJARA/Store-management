import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import ProductsView from './views/ProductsView.vue'
import PurchasesView from './views/PurchasesView.vue'
import SalesView from './views/SalesView.vue'
import DashboardView from './views/DashboardView.vue'

const routes = [
  { path: '/', component: DashboardView },
  { path: '/products', component: ProductsView },
  { path: '/purchases', component: PurchasesView },
  { path: '/sales', component: SalesView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')

