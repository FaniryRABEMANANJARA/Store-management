<template>
  <div class="products-view">
    <div class="header">
      <h1>Produits</h1>
      <button class="btn-primary" @click="showModal = true">
        + Ajouter un produit
      </button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Date de création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.description || '-' }}</td>
            <td>{{ formatDate(product.createdAt) }}</td>
            <td>
              <button
                class="btn-danger"
                @click="deleteProduct(product.id)"
                style="padding: 0.5rem 1rem; font-size: 0.9rem"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nouveau Produit</h2>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <form @submit.prevent="createProduct">
          <div class="form-group">
            <label>Nom *</label>
            <input v-model="newProduct.name" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newProduct.description" rows="3"></textarea>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end">
            <button type="button" @click="showModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productsApi, type Product } from '@/api/client'

const products = ref<Product[]>([])
const showModal = ref(false)
const newProduct = ref({ name: '', description: '' })

const loadProducts = async () => {
  try {
    const response = await productsApi.getAll()
    products.value = response.data
  } catch (error) {
    console.error('Error loading products:', error)
    alert('Erreur lors du chargement des produits')
  }
}

const createProduct = async () => {
  try {
    await productsApi.create(newProduct.value)
    newProduct.value = { name: '', description: '' }
    showModal.value = false
    loadProducts()
  } catch (error) {
    console.error('Error creating product:', error)
    alert('Erreur lors de la création du produit')
  }
}

const deleteProduct = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

  try {
    await productsApi.delete(id)
    loadProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    alert('Erreur lors de la suppression du produit')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(() => {
  loadProducts()
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

