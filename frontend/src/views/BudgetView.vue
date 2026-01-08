<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="primary" size="small">mdi-chart-line</v-icon>
          Budget & Chiffre d'Affaires
        </h1>
        <v-btn
          color="primary"
           @click="loadData"
          :loading="loading"
          class="d-sm-inline-block w-100 w-sm-auto"
          :size="$vuetify.display.xs ? 'small' : 'default'"
          :block="$vuetify.display.xs"
        >
          <v-icon class="mr-2" size="small">mdi-refresh</v-icon>
          Actualiser
        </v-btn>
      </v-col>
    </v-row>

    <!-- Cartes de résumé -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark class="elevation-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption opacity-75 mb-1">Chiffre d'Affaires Total</div>
                <div class="text-h5 font-weight-bold">{{ formatCurrency(totalRevenue) }}</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-trending-up</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="error" dark class="elevation-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption opacity-75 mb-1">Coûts Totaux</div>
                <div class="text-h5 font-weight-bold">{{ formatCurrency(totalCosts) }}</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-trending-down</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card :color="totalProfit >= 0 ? 'primary' : 'warning'" dark class="elevation-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption opacity-75 mb-1">Bénéfice Net</div>
                <div class="text-h5 font-weight-bold">{{ formatCurrency(totalProfit) }}</div>
              </div>
              <v-icon size="48" class="opacity-50">
                {{ totalProfit >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark class="elevation-4">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption opacity-75 mb-1">Marge Bénéficiaire</div>
                <div class="text-h5 font-weight-bold">{{ profitMargin }}%</div>
              </div>
              <v-icon size="48" class="opacity-50">mdi-percent</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistiques détaillées -->
    <v-row>
      <!-- Statistiques des ventes -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="success">mdi-cart-arrow-up</v-icon>
            Statistiques des Ventes
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nombre total de ventes</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ sales.length }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Quantité totale vendue</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ totalQuantitySold }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Prix moyen de vente</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ formatCurrency(averageSalePrice) }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Revenu moyen par vente</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ formatCurrency(averageRevenuePerSale) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Statistiques des achats -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="error">mdi-cart-arrow-down</v-icon>
            Statistiques des Achats
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Nombre total d'achats</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ purchases.length }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Quantité totale achetée</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ totalQuantityPurchased }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Prix moyen d'achat (RMB)</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ formatCurrencyRMB(averagePurchasePriceRMB) }}</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Coût moyen par achat (MGA)</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">{{ formatCurrency(averageCostPerPurchase) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tableau des bénéfices par produit -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
            Bénéfices par Produit
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="profitHeaders"
              :items="productProfits"
              :loading="loading"
              item-key="productId"
              class="elevation-1"
            >
              <template v-slot:item.totalCost="{ item }">
                <span class="text-error">{{ formatCurrency(item.totalCost) }}</span>
              </template>
              <template v-slot:item.totalRevenue="{ item }">
                <span class="text-success">{{ formatCurrency(item.totalRevenue) }}</span>
              </template>
              <template v-slot:item.profit="{ item }">
                <v-chip
                  :color="item.profit >= 0 ? 'success' : 'error'"
                  dark
                  size="small"
                >
                  {{ formatCurrency(item.profit) }}
                </v-chip>
              </template>
              <template v-slot:item.profitMargin="{ item }">
                <span :class="item.profitMargin >= 0 ? 'text-success' : 'text-error'">
                  {{ item.profitMargin.toFixed(2) }}%
                </span>
              </template>
              <template v-slot:item.stock="{ item }">
                <v-chip
                  :color="item.stock > 0 ? 'info' : 'warning'"
                  dark
                  size="small"
                >
                  {{ item.stock }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Graphique de répartition -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-chart-pie</v-icon>
            Répartition des Coûts et Revenus
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center">
                <v-icon color="success" class="mr-2">mdi-circle</v-icon>
                <span>Revenus: {{ formatCurrency(totalRevenue) }}</span>
              </div>
              <div class="d-flex align-center">
                <v-icon color="error" class="mr-2">mdi-circle</v-icon>
                <span>Coûts: {{ formatCurrency(totalCosts) }}</span>
              </div>
            </div>
            <v-progress-linear
              :model-value="revenuePercentage"
              color="success"
              height="30"
              rounded
              class="mb-2"
            >
              <template v-slot:default="{ value }">
                <strong>{{ value.toFixed(1) }}%</strong>
              </template>
            </v-progress-linear>
            <v-progress-linear
              :model-value="costPercentage"
              color="error"
              height="30"
              rounded
            >
              <template v-slot:default="{ value }">
                <strong>{{ value.toFixed(1) }}%</strong>
              </template>
            </v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-information</v-icon>
            Informations Taux de Change
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Taux de change actif</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6 font-weight-bold">
                    {{ activeExchangeRate?.rate || 'Non défini' }}
                  </span>
                </template>
              </v-list-item>
              <v-list-item v-if="activeExchangeRate">
                <v-list-item-title>Date d'activation</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-2">{{ formatDate(activeExchangeRate.date) }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  salesApi,
  purchasesApi,
  productsApi,
  exchangeRatesApi,
  type Sale,
  type Purchase,
  type Product,
  type ExchangeRate,
  type Profit,
} from '@/api/client'

const sales = ref<Sale[]>([])
const purchases = ref<Purchase[]>([])
const products = ref<Product[]>([])
const activeExchangeRate = ref<ExchangeRate | null>(null)
const productProfits = ref<(Profit & { profitMargin: number })[]>([])
const loading = ref(false)

// Calculs des totaux
const totalRevenue = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.totalRevenue, 0)
})

const totalCosts = computed(() => {
  return purchases.value.reduce((sum, purchase) => sum + purchase.totalCostMGA, 0)
})

const totalProfit = computed(() => {
  return totalRevenue.value - totalCosts.value
})

const profitMargin = computed(() => {
  if (totalRevenue.value === 0) return 0
  return ((totalProfit.value / totalRevenue.value) * 100).toFixed(2)
})

const totalQuantitySold = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.quantity, 0)
})

const totalQuantityPurchased = computed(() => {
  return purchases.value.reduce((sum, purchase) => sum + purchase.quantity, 0)
})

const averageSalePrice = computed(() => {
  if (sales.value.length === 0) return 0
  const total = sales.value.reduce((sum, sale) => sum + sale.priceMGA, 0)
  return total / sales.value.length
})

const averageRevenuePerSale = computed(() => {
  if (sales.value.length === 0) return 0
  return totalRevenue.value / sales.value.length
})

const averagePurchasePriceRMB = computed(() => {
  if (purchases.value.length === 0) return 0
  const total = purchases.value.reduce((sum, purchase) => sum + purchase.priceRMB, 0)
  return total / purchases.value.length
})

const averageCostPerPurchase = computed(() => {
  if (purchases.value.length === 0) return 0
  return totalCosts.value / purchases.value.length
})

const revenuePercentage = computed(() => {
  const total = totalRevenue.value + totalCosts.value
  if (total === 0) return 0
  return (totalRevenue.value / total) * 100
})

const costPercentage = computed(() => {
  const total = totalRevenue.value + totalCosts.value
  if (total === 0) return 0
  return (totalCosts.value / total) * 100
})

const profitHeaders = [
  { title: 'Produit', key: 'productName' },
  { title: 'Coût Total (MGA)', key: 'totalCost' },
  { title: 'Revenu Total (MGA)', key: 'totalRevenue' },
  { title: 'Bénéfice/Perte (MGA)', key: 'profit' },
  { title: 'Marge (%)', key: 'profitMargin' },
  { title: 'Acheté', key: 'totalPurchased' },
  { title: 'Vendu', key: 'totalSold' },
  { title: 'Stock', key: 'stock' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [salesRes, purchasesRes, productsRes, exchangeRes] = await Promise.all([
      salesApi.getAll(),
      purchasesApi.getAll(),
      productsApi.getAll(),
      exchangeRatesApi.getActive(),
    ])

    // Extract data array from PaginationResult (API always returns paginated results)
    sales.value = salesRes.data.data
    purchases.value = purchasesRes.data.data
    products.value = productsRes.data.data
    activeExchangeRate.value = exchangeRes.data

    // Charger les bénéfices par produit
    const profitPromises = products.value.map((product) =>
      productsApi.getProfit(product.id)
    )
    const profitResults = await Promise.all(profitPromises)
    
    // Calculer la marge bénéficiaire pour chaque produit
    productProfits.value = profitResults.map((res) => {
      const profit = res.data
      const margin = profit.totalRevenue > 0
        ? ((profit.profit / profit.totalRevenue) * 100)
        : 0
      return {
        ...profit,
        profitMargin: margin,
      }
    })
  } catch (error) {
    console.error('Error loading budget data:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatCurrencyRMB = (value: number) => {
  return new Intl.NumberFormat('fr-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Enlever les bordures internes des inputs */
:deep(.v-field__input) {
  border: none !important;
  box-shadow: none !important;
}

:deep(.v-field__field) {
  border: none !important;
}

:deep(.v-input__details) {
  border: none !important;
}
</style>

