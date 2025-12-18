<template>
  <div class="sales-view">
    <div class="header">
      <h1>Ventes</h1>
      <button class="btn-primary" @click="showModal = true">
        + Enregistrer une vente
      </button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix unitaire (MGA)</th>
            <th>Revenu total (MGA)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sale in sales" :key="sale.id">
            <td>{{ sale.product?.name || 'N/A' }}</td>
            <td>{{ sale.quantity }}</td>
            <td>{{ formatCurrency(sale.priceMGA) }}</td>
            <td>{{ formatCurrency(sale.totalRevenue) }}</td>
            <td>{{ formatDate(sale.saleDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nouvelle Vente</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="createSale">
          <div class="form-group">
            <label>Produit *</label>
            <select v-model="newSale.productId" required>
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
              v-model.number="newSale.quantity"
              type="number"
              min="1"
              required
            />
          </div>
          <div class="form-group">
            <label>Prix de vente (MGA) *</label>
            <input
              v-model.number="newSale.priceMGA"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div class="form-group">
            <label>Date de vente</label>
            <input v-model="newSale.saleDate" type="date" />
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
import { salesApi, productsApi, type Sale, type Product } from '@/api/client'

const sales = ref<Sale[]>([])
const products = ref<Product[]>([])
const showModal = ref(false)
const newSale = ref({
  productId: '',
  quantity: 1,
  priceMGA: 0,
  saleDate: new Date().toISOString().split('T')[0],
})

const loadData = async () => {
  try {
    const [salesRes, productsRes] = await Promise.all([
      salesApi.getAll(),
      productsApi.getAll(),
    ])

    sales.value = salesRes.data
    products.value = productsRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const createSale = async () => {
  try {
    await salesApi.create(newSale.value)
    newSale.value = {
      productId: '',
      quantity: 1,
      priceMGA: 0,
      saleDate: new Date().toISOString().split('T')[0],
    }
    showModal.value = false
    loadData()
  } catch (error) {
    console.error('Error creating sale:', error)
    alert('Erreur lors de l\'enregistrement de la vente')
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
</style>

