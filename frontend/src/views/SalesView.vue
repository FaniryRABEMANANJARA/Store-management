<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="info" size="small">mdi-cart-arrow-up</v-icon>
          Ventes
        </h1>
        <v-btn color="info" @click="showDialog = true" class="d-sm-inline-block w-100 w-sm-auto" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
          <v-icon class="mr-2" size="small">mdi-plus</v-icon>
          Enregistrer une vente
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Historique des Ventes</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="sales"
              :loading="loading"
              item-key="id"
            >
              <template v-slot:item.product="{ item }">
                {{ item.product?.name || 'N/A' }}
              </template>
              <template v-slot:item.priceMGA="{ item }">
                {{ formatCurrency(item.priceMGA) }}
              </template>
              <template v-slot:item.totalRevenue="{ item }">
                {{ formatCurrency(item.totalRevenue) }}
              </template>
              <template v-slot:item.saleDate="{ item }">
                {{ formatDate(item.saleDate) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="700" persistent>
      <v-card class="overflow-hidden">
        <v-card-title class="text-white bg-info pa-6">
          <v-icon class="mr-3" size="28">mdi-cart-arrow-up</v-icon>
          <span class="text-h5 font-weight-bold">Nouvelle Vente</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="saleForm" @submit.prevent="createSale">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newSale.productId"
                  :items="products"
                  item-title="name"
                  item-value="id"
                  label="Produit *"
                  required
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Veuillez sélectionner un produit']"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newSale.quantity"
                  label="Quantité *"
                  type="number"
                  min="1"
                  required
                  prepend-inner-icon="mdi-numeric"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'La quantité doit être supérieure à 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newSale.priceMGA"
                  label="Prix de vente (MGA) *"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  prepend-inner-icon="mdi-currency-usd"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'Le prix doit être supérieur à 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newSale.saleDate"
                  label="Date de vente"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="success" variant="tonal" class="h-100 d-flex align-center">
                  <v-card-text>
                    <div class="text-caption text-medium-emphasis">Revenu total estimé</div>
                    <div class="text-h6 font-weight-bold">
                      {{ calculateTotalRevenue() }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="showDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="info"
            prepend-icon="mdi-check"
            @click="createSale"
            :loading="loading"
          >
            Enregistrer la vente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { salesApi, productsApi, type Sale, type Product } from '@/api/client'

const sales = ref<Sale[]>([])
const products = ref<Product[]>([])
const showDialog = ref(false)
const loading = ref(false)
const saleForm = ref<any>(null)
const newSale = ref({
  productId: '',
  quantity: 1,
  priceMGA: 0,
  saleDate: new Date().toISOString().split('T')[0],
})

const headers = [
  { title: 'Produit', key: 'product' },
  { title: 'Quantité', key: 'quantity' },
  { title: 'Prix unitaire (MGA)', key: 'priceMGA' },
  { title: 'Revenu total (MGA)', key: 'totalRevenue' },
  { title: 'Date', key: 'saleDate' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [salesRes, productsRes] = await Promise.all([
      salesApi.getAll(),
      productsApi.getAll(),
    ])

    sales.value = salesRes.data
    products.value = productsRes.data
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const createSale = async () => {
  const { valid } = await saleForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await salesApi.create(newSale.value)
    newSale.value = {
      productId: '',
      quantity: 1,
      priceMGA: 0,
      saleDate: new Date().toISOString().split('T')[0],
    }
    showDialog.value = false
    loadData()
  } catch (error) {
    console.error('Error creating sale:', error)
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

const calculateTotalRevenue = () => {
  const quantity = newSale.value.quantity || 0
  const priceMGA = newSale.value.priceMGA || 0
  const total = quantity * priceMGA
  return total > 0 ? formatCurrency(total) : '0 MGA'
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