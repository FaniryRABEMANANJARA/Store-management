<template>
  <div class="purchases-view">
    <div class="header">
      <h1>Achats</h1>
      <button class="btn-primary" @click="showModal = true">
        + Enregistrer un achat
      </button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix (RMB)</th>
            <th>Taux de change</th>
            <th>Coût total (MGA)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="purchase in purchases" :key="purchase.id">
            <td>{{ purchase.product?.name || 'N/A' }}</td>
            <td>{{ purchase.quantity }}</td>
            <td>{{ purchase.priceRMB }}</td>
            <td>{{ purchase.exchangeRate }}</td>
            <td>{{ formatCurrency(purchase.totalCostMGA) }}</td>
            <td>{{ formatDate(purchase.purchaseDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nouvel Achat</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="createPurchase">
          <div class="form-group">
            <label>Produit *</label>
            <select v-model="newPurchase.productId" required>
              <option value="">Sélectionner un produit</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantité *</label>
            <input
              v-model.number="newPurchase.quantity"
              type="number"
              min="1"
              required
            />
          </div>
          <div class="form-group">
            <label>Prix d'achat (RMB) *</label>
            <input
              v-model.number="newPurchase.priceRMB"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div class="form-group">
            <label>Taux de change (RMB → MGA) *</label>
            <input
              v-model.number="newPurchase.exchangeRate"
              type="number"
              step="0.01"
              min="0"
              required
            />
            <small v-if="activeExchangeRate"
              >Taux actif: {{ activeExchangeRate.rate }}</small
            >
          </div>
          <div class="form-group">
            <label>Date d'achat</label>
            <input v-model="newPurchase.purchaseDate" type="date" />
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end">
            <button type="button" @click="showModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  purchasesApi,
  productsApi,
  exchangeRatesApi,
  type Purchase,
  type Product,
  type ExchangeRate,
} from '@/api/client'

const purchases = ref<Purchase[]>([])
const products = ref<Product[]>([])
const activeExchangeRate = ref<ExchangeRate | null>(null)
const showModal = ref(false)
const newPurchase = ref({
  productId: '',
  quantity: 1,
  priceRMB: 0,
  exchangeRate: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
})

const loadData = async () => {
  try {
    const [purchasesRes, productsRes, exchangeRes] = await Promise.all([
      purchasesApi.getAll(),
      productsApi.getAll(),
      exchangeRatesApi.getActive(),
    ])

    purchases.value = purchasesRes.data
    products.value = productsRes.data
    activeExchangeRate.value = exchangeRes.data

    if (activeExchangeRate.value) {
      newPurchase.value.exchangeRate = activeExchangeRate.value.rate
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const createPurchase = async () => {
  try {
    await purchasesApi.create(newPurchase.value)
    newPurchase.value = {
      productId: '',
      quantity: 1,
      priceRMB: 0,
      exchangeRate: activeExchangeRate.value?.rate || 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    }
    showModal.value = false
    loadData()
  } catch (error) {
    console.error('Error creating purchase:', error)
    alert('Erreur lors de l\'enregistrement de l\'achat')
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
}

small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.85rem;
}
</style>

