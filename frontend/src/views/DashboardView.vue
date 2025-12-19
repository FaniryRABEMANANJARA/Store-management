<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">
          <v-icon class="mr-2" color="primary">mdi-view-dashboard</v-icon>
          Dashboard
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h6 mb-2">
              <v-icon class="mr-2">mdi-package-variant</v-icon>
              Total Produits
            </div>
            <div class="text-h3">{{ products.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h6 mb-2">
              <v-icon class="mr-2">mdi-cart-arrow-down</v-icon>
              Total Achats
            </div>
            <div class="text-h3">{{ purchases.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h6 mb-2">
              <v-icon class="mr-2">mdi-cart-arrow-up</v-icon>
              Total Ventes
            </div>
            <div class="text-h3">{{ sales.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h6 mb-2">
              <v-icon class="mr-2">mdi-currency-exchange</v-icon>
              Taux de Change
            </div>
            <div class="text-h3">
              {{ activeExchangeRate?.rate ? activeExchangeRate.rate.toLocaleString('fr-FR') : 'N/A' }}
            </div>
            <div v-if="!activeExchangeRate" class="text-caption mt-1 opacity-75">
              Aucun taux actif
            </div>
            <div v-else-if="activeExchangeRate.date" class="text-caption mt-1 opacity-75">
              {{ formatDate(activeExchangeRate.date) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
            Bénéfices par Produit
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="profitHeaders"
              :items="profits"
              :loading="loading"
              item-key="productId"
            >
              <template v-slot:item.totalCost="{ item }">
                {{ formatCurrency(item.totalCost) }}
              </template>
              <template v-slot:item.totalRevenue="{ item }">
                {{ formatCurrency(item.totalRevenue) }}
              </template>
              <template v-slot:item.profit="{ item }">
                <v-chip
                  :color="item.profit >= 0 ? 'success' : 'error'"
                  dark
                >
                  {{ formatCurrency(item.profit) }}
                </v-chip>
              </template>
              <template v-slot:item.stock="{ item }">
                <v-chip
                  :color="item.stock > 0 ? 'info' : 'warning'"
                  dark
                >
                  {{ item.stock }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
const loading = ref(false)

const profitHeaders = [
  { title: 'Produit', key: 'productName' },
  { title: 'Coût Total (MGA)', key: 'totalCost' },
  { title: 'Revenu Total (MGA)', key: 'totalRevenue' },
  { title: 'Bénéfice/Perte (MGA)', key: 'profit' },
  { title: 'Stock', key: 'stock' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [productsRes, purchasesRes, salesRes, exchangeRes] = await Promise.all([
      productsApi.getAll(),
      purchasesApi.getAll(),
      salesApi.getAll(),
      exchangeRatesApi.getActive().catch(() => ({ data: null })), // Gérer le cas où il n'y a pas de taux actif
    ])

    products.value = productsRes.data
    purchases.value = purchasesRes.data
    sales.value = salesRes.data
    activeExchangeRate.value = exchangeRes.data || null

    const profitPromises = products.value.map((product) =>
      productsApi.getProfit(product.id)
    )
    const profitResults = await Promise.all(profitPromises)
    profits.value = profitResults.map((res) => res.data)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(() => {
  loadData()
})
</script>
