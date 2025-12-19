<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="warning" size="small">mdi-cart-outline</v-icon>
          Commandes
        </h1>
        <v-btn color="warning" @click="showCreateDialog = true" class="d-sm-inline-block w-100 w-sm-auto" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
          <v-icon class="mr-2" size="small">mdi-cart-plus</v-icon>
          Créer une commande
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Liste des Commandes</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="orders"
              :loading="loading"
              item-key="id"
            >
              <template v-slot:item.product="{ item }">
                {{ item.product?.name || 'N/A' }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  dark
                >
                  {{ getStatusLabel(item.status) }}
                </v-chip>
              </template>
              <template v-slot:item.totalCostMGA="{ item }">
                {{ formatCurrency(item.totalCostMGA) }}
              </template>
              <template v-slot:item.orderDate="{ item }">
                {{ formatDate(item.orderDate) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-check"
                  color="success"
                  size="small"
                  variant="text"
                  @click="convertToPurchase(item)"
                  :disabled="item.status === 'completed'"
                  title="Convertir en achat"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  color="warning"
                  size="small"
                  variant="text"
                  @click="editOrder(item)"
                  :disabled="item.status === 'completed'"
                  title="Modifier"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  size="small"
                  variant="text"
                  @click="deleteOrder(item.id)"
                  title="Supprimer"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog pour créer une commande -->
    <v-dialog v-model="showCreateDialog" max-width="700" persistent>
      <v-card class="overflow-hidden">
        <v-card-title class="text-white bg-warning pa-6">
          <v-icon class="mr-3" size="28">mdi-cart-plus</v-icon>
          <span class="text-h5 font-weight-bold">Nouvelle Commande</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="orderForm" @submit.prevent="createOrder">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newOrder.productId"
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
                  v-model.number="newOrder.quantity"
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
                  v-model.number="newOrder.priceRMB"
                  label="Prix d'achat estimé (RMB) *"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  prepend-inner-icon="mdi-currency-cny"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'Le prix doit être supérieur à 0']"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-card color="info" variant="tonal" class="mb-4">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2">mdi-information</v-icon>
                      <strong>Taux de change actif: {{ activeExchangeRate?.rate || 'Non défini' }}</strong>
                    </div>
                    <v-text-field
                      v-model.number="newOrder.exchangeRate"
                      label="Taux de change (RMB → MGA) *"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      prepend-inner-icon="mdi-currency-exchange"
                      variant="outlined"
                      density="comfortable"
                      :rules="[v => v > 0 || 'Le taux de change doit être supérieur à 0']"
                    ></v-text-field>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newOrder.orderDate"
                  label="Date de commande"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="primary" variant="tonal" class="h-100 d-flex align-center">
                  <v-card-text>
                    <div class="text-caption text-medium-emphasis">Coût total estimé</div>
                    <div class="text-h6 font-weight-bold">
                      {{ calculateTotalCost() }}
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
            @click="showCreateDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-check"
            @click="createOrder"
            :loading="loading"
          >
            Créer la commande
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour modifier une commande -->
    <v-dialog v-model="showEditDialog" max-width="700" persistent>
      <v-card v-if="editingOrder" class="overflow-hidden">
        <v-card-title class="text-white bg-warning pa-6">
          <v-icon class="mr-3" size="28">mdi-pencil-box</v-icon>
          <span class="text-h5 font-weight-bold">Modifier la Commande</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="editOrderForm" @submit.prevent="updateOrder">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="editingOrder.productId"
                  :items="products"
                  item-title="name"
                  item-value="id"
                  label="Produit *"
                  required
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Veuillez sélectionner un produit']"
                  :disabled="editingOrder.status === 'completed'"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingOrder.quantity"
                  label="Quantité *"
                  type="number"
                  min="1"
                  required
                  prepend-inner-icon="mdi-numeric"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'La quantité doit être supérieure à 0']"
                  :disabled="editingOrder.status === 'completed'"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingOrder.priceRMB"
                  label="Prix d'achat estimé (RMB) *"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  prepend-inner-icon="mdi-currency-cny"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'Le prix doit être supérieur à 0']"
                  :disabled="editingOrder.status === 'completed'"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingOrder.exchangeRate"
                  label="Taux de change (RMB → MGA) *"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  prepend-inner-icon="mdi-currency-exchange"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => v > 0 || 'Le taux de change doit être supérieur à 0']"
                  :disabled="editingOrder.status === 'completed'"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingOrder.orderDate"
                  label="Date de commande"
                  type="date"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                  :disabled="editingOrder.status === 'completed'"
                ></v-text-field>
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
            @click="showEditDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-content-save"
            @click="updateOrder"
            :loading="loading"
            :disabled="editingOrder.status === 'completed'"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ordersApi,
  productsApi,
  exchangeRatesApi,
  purchasesApi,
  type Order,
  type Product,
  type ExchangeRate,
} from '@/api/client'

const orders = ref<Order[]>([])
const products = ref<Product[]>([])
const activeExchangeRate = ref<ExchangeRate | null>(null)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const loading = ref(false)
const orderForm = ref<any>(null)
const editOrderForm = ref<any>(null)
const editingOrder = ref<Order | null>(null)

const newOrder = ref({
  productId: '',
  quantity: 1,
  priceRMB: 0,
  exchangeRate: 0,
  orderDate: new Date().toISOString().split('T')[0],
})

const headers = [
  { title: 'Produit', key: 'product' },
  { title: 'Quantité', key: 'quantity' },
  { title: 'Prix (RMB)', key: 'priceRMB' },
  { title: 'Taux de change', key: 'exchangeRate' },
  { title: 'Coût total (MGA)', key: 'totalCostMGA' },
  { title: 'Statut', key: 'status' },
  { title: 'Date', key: 'orderDate' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const loadData = async () => {
  loading.value = true
  try {
    const [ordersRes, productsRes, exchangeRes] = await Promise.all([
      ordersApi.getAll(),
      productsApi.getAll(),
      exchangeRatesApi.getActive(),
    ])

    orders.value = ordersRes.data
    products.value = productsRes.data
    activeExchangeRate.value = exchangeRes.data

    if (activeExchangeRate.value && !newOrder.value.exchangeRate) {
      newOrder.value.exchangeRate = activeExchangeRate.value.rate
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const createOrder = async () => {
  const { valid } = await orderForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    const response = await ordersApi.create(newOrder.value)
    newOrder.value = {
      productId: '',
      quantity: 1,
      priceRMB: 0,
      exchangeRate: activeExchangeRate.value?.rate || 0,
      orderDate: new Date().toISOString().split('T')[0],
    }
    showCreateDialog.value = false
    loadData()
  } catch (error: any) {
    console.error('Error creating order:', error)
    const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Erreur lors de la création de la commande'
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const editOrder = (order: Order) => {
  editingOrder.value = { ...order }
  showEditDialog.value = true
}

const updateOrder = async () => {
  if (!editingOrder.value) return

  const { valid } = await editOrderForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await ordersApi.update(editingOrder.value.id, editingOrder.value)
    showEditDialog.value = false
    editingOrder.value = null
    loadData()
  } catch (error) {
    console.error('Error updating order:', error)
  } finally {
    loading.value = false
  }
}

const deleteOrder = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
    return
  }

  try {
    await ordersApi.delete(id)
    loadData()
  } catch (error) {
    console.error('Error deleting order:', error)
  }
}

const convertToPurchase = async (order: Order) => {
  if (!confirm('Voulez-vous convertir cette commande en achat ?')) {
    return
  }

  try {
    loading.value = true
    // Créer un achat à partir de la commande
    await purchasesApi.create({
      productId: order.productId,
      quantity: order.quantity,
      priceRMB: order.priceRMB,
      exchangeRate: order.exchangeRate,
      purchaseDate: new Date().toISOString().split('T')[0],
    })
    
    // Marquer la commande comme complétée
    await ordersApi.update(order.id, { ...order, status: 'completed' })
    
    loadData()
  } catch (error) {
    console.error('Error converting order to purchase:', error)
  } finally {
    loading.value = false
  }
}

const calculateTotalCost = () => {
  const quantity = newOrder.value.quantity || 0
  const priceRMB = newOrder.value.priceRMB || 0
  const exchangeRate = newOrder.value.exchangeRate || 0
  const total = quantity * priceRMB * exchangeRate
  return total > 0 ? formatCurrency(total) : '0 MGA'
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    cancelled: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Complétée',
    cancelled: 'Annulée',
  }
  return labels[status] || status
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

