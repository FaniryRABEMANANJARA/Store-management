<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Produits</h3>
        <p class="stat-value">{{ products.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Achats</h3>
        <p class="stat-value">{{ purchases.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Total Ventes</h3>
        <p class="stat-value">{{ sales.length }}</p>
      </div>
      <div class="stat-card">
        <h3>Taux de Change Actif</h3>
        <p class="stat-value">{{ activeExchangeRate?.rate || 'N/A' }}</p>
      </div>
    </div>

    <div class="card">
      <h2>Bénéfices par Produit</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Coût Total (MGA)</th>
            <th>Revenu Total (MGA)</th>
            <th>Bénéfice/Perte (MGA)</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="profit in profits" :key="profit.productId">
            <td>{{ profit.productName }}</td>
            <td>{{ formatCurrency(profit.totalCost) }}</td>
            <td>{{ formatCurrency(profit.totalRevenue) }}</td>
            <td :class="profit.profit >= 0 ? 'profit' : 'loss'">
              {{ formatCurrency(profit.profit) }}
            </td>
            <td>{{ profit.stock }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  productsApi,
  purchasesApi,
  salesApi,
  exchangeRatesApi,
  type Product,
  type Purchase,
  type Sale,
  type ExchangeRate,
  type Profit,
} from '@/api/client'

const products = ref<Product[]>([])
const purchases = ref<Purchase[]>([])
const sales = ref<Sale[]>([])
const activeExchangeRate = ref<ExchangeRate | null>(null)
const profits = ref<Profit[]>([])

const loadData = async () => {
  try {
    const [productsRes, purchasesRes, salesRes, exchangeRes] = await Promise.all([
      productsApi.getAll(),
      purchasesApi.getAll(),
      salesApi.getAll(),
      exchangeRatesApi.getActive(),
    ])

    products.value = productsRes.data
    purchases.value = purchasesRes.data
    sales.value = salesRes.data
    activeExchangeRate.value = exchangeRes.data

    // Calculer les bénéfices pour chaque produit
    const profitPromises = products.value.map((product) =>
      productsApi.getProfit(product.id)
    )
    const profitResults = await Promise.all(profitPromises)
    profits.value = profitResults.map((res) => res.data)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
  }).format(value)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard h1 {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.profit {
  color: #27ae60;
  font-weight: bold;
}

.loss {
  color: #e74c3c;
  font-weight: bold;
}
</style>

