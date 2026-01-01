<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="success" size="small">mdi-cart-arrow-down</v-icon>
          Achats
        </h1>
        <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto" style="gap: 5px;">
          <v-btn color="info" @click="showOrderModeDialog = true" class="d-sm-inline-block" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
            <v-icon class="mr-2" size="small">mdi-cart-outline</v-icon>
            Créer une commande
          </v-btn>

          <v-btn color="success" @click="showDialog = true" class="d-sm-inline-block" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
            <v-icon class="mr-2" size="small">mdi-cart-plus</v-icon>
              Enregistrer un achat
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Historique des Achats</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="purchases"
              :loading="loading"
              item-key="id"
            >
              <template v-slot:item.product="{ item }">
                {{ item.product?.name || 'N/A' }}
              </template>
              <template v-slot:item.totalCostMGA="{ item }">
                {{ formatCurrency(item.totalCostMGA) }}
              </template>
              <template v-slot:item.purchaseDate="{ item }">
                {{ formatDate(item.purchaseDate) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-information-outline"
                  size="small"
                  color="info"
                  variant="text"
                  @click="showPurchaseDetails(item)"
                >
                  <v-icon>mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Voir les détails du coût
                  </v-tooltip>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="700" persistent scrollable>
      <v-card class="overflow-hidden">
        <v-card-title class="text-white bg-success pa-6">
          <v-icon class="mr-3" size="28">mdi-cart-plus</v-icon>
          <span class="text-h5 font-weight-bold">Nouvel Achat</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="purchaseForm" @submit.prevent="createPurchase">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newPurchase.productId"
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
                  v-model.number="newPurchase.quantity"
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
                  v-model.number="newPurchase.priceRMB"
                  label="Prix d'achat (RMB) *"
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
                      v-model.number="newPurchase.exchangeRate"
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
                  v-model="newPurchase.purchaseDate"
                  label="Date d'achat"
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
            @click="showDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="mdi-check"
            @click="createPurchase"
            :loading="loading"
          >
            Enregistrer l'achat
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour choisir le mode de saisie -->
    <v-dialog v-model="showOrderModeDialog" max-width="500" persistent scrollable>
      <v-card>
        <v-card-title class="text-white bg-info pa-6">
          <v-icon class="mr-3" size="28">mdi-cart-outline</v-icon>
          <span class="text-h5 font-weight-bold">Mode de saisie</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-body-1 mb-4">Choisissez comment vous souhaitez saisir les informations de la commande :</div>
          <v-btn
            color="primary"
            block
            size="large"
            prepend-icon="mdi-currency-cny"
            @click="orderInputMode = 'price'; showOrderModeDialog = false; showOrderDialog = true"
            class="mb-3"
          >
            <div class="text-left w-100">
              <div class="font-weight-bold">Mode Prix d'achat</div>
              <div class="text-caption">Saisir le prix d'achat en RMB et la quantité</div>
            </div>
          </v-btn>
          <v-btn
            color="success"
            block
            size="large"
            prepend-icon="mdi-cash"
            @click="orderInputMode = 'total'; showOrderModeDialog = false; showOrderDialog = true"
          >
            <div class="text-left w-100">
              <div class="font-weight-bold">Mode Coût total</div>
              <div class="text-caption">Saisir le coût total en MGA, le taux de change et la quantité</div>
            </div>
          </v-btn>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="showOrderModeDialog = false"
          >
            Annuler
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour créer une commande -->
    <v-dialog v-model="showOrderDialog" max-width="700" persistent scrollable>
      <v-card class="overflow-hidden">
        <v-card-title class="text-white bg-info pa-6">
          <v-icon class="mr-3" size="28">mdi-cart-outline</v-icon>
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
              
              <!-- Mode Prix d'achat -->
              <template v-if="orderInputMode === 'price'">
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
                  <div class="mt-2 text-caption text-medium-emphasis d-flex align-center">
                    <v-icon size="small" class="mr-1" color="orange">mdi-currency-cny</v-icon>
                    <span>Prix: {{ newOrder.priceRMB ? newOrder.priceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ¥</span>
                  </div>
                </v-col>
              </template>
              
              <!-- Mode Coût total -->
              <template v-else>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="newOrder.totalCostMGA"
                    label="Coût total estimé (MGA) *"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    prepend-inner-icon="mdi-cash"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => v > 0 || 'Le coût total doit être supérieur à 0']"
                  ></v-text-field>
                  <div class="mt-2 text-caption text-medium-emphasis d-flex align-center">
                    <v-icon size="small" class="mr-1" color="success">mdi-cash</v-icon>
                    <span>Total: {{ newOrder.totalCostMGA ? formatCurrency(newOrder.totalCostMGA) : '0 MGA' }}</span>
                  </div>
                </v-col>
              </template>
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
              <v-col cols="12">
                <v-card color="info" variant="tonal" class="mb-4">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-icon class="mr-2" color="info">mdi-information</v-icon>
                      <strong>Taux de change actif: {{ activeExchangeRate?.rate ? activeExchangeRate.rate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Non défini' }}</strong>
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
                    <div class="mt-2 text-caption text-medium-emphasis d-flex align-center">
                      <v-icon size="small" class="mr-1" color="info">mdi-currency-exchange</v-icon>
                      <span>Taux: {{ newOrder.exchangeRate ? newOrder.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Champs Extra et Bénéfice -->
              <v-col cols="12" md="6">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-2" color="warning">mdi-plus-circle</v-icon>
                  <span class="text-subtitle-1 font-weight-medium">Extras (RMB)</span>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    size="small"
                    prepend-icon="mdi-plus"
                    @click="addExtra"
                    variant="outlined"
                  >
                    Ajouter
                  </v-btn>
                </div>
                <v-card
                  v-for="(extra, index) in newOrder.extras"
                  :key="index"
                  variant="outlined"
                  class="mb-3"
                >
                  <v-card-text>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2" color="warning" size="small">mdi-tag</v-icon>
                      <span class="text-caption text-medium-emphasis">Extra {{ index + 1 }}</span>
                      <v-spacer></v-spacer>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="removeExtra(index)"
                      ></v-btn>
                    </div>
                    <v-text-field
                      v-model.number="extra.amount"
                      label="Montant (RMB)"
                      type="number"
                      step="0.01"
                      min="0"
                      prepend-inner-icon="mdi-currency-cny"
                      variant="outlined"
                      density="comfortable"
                      class="mb-2"
                    ></v-text-field>
                    <v-text-field
                      v-model="extra.description"
                      label="Description"
                      placeholder="Ex: Transport, Frais de douane, etc."
                      prepend-inner-icon="mdi-text-box-outline"
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-card-text>
                </v-card>
                <div v-if="newOrder.extras.length === 0" class="text-caption text-medium-emphasis text-center pa-4">
                  Aucun extra ajouté. Cliquez sur "Ajouter" pour en ajouter un.
                </div>
                <div v-if="totalExtrasRMB > 0" class="mt-2 text-caption text-medium-emphasis d-flex align-center">
                  <v-icon size="small" class="mr-1" color="warning">mdi-calculator</v-icon>
                  <span>Total extras: {{ totalExtrasRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newOrder.profit"
                  label="Bénéfice souhaité (RMB)"
                  type="number"
                  step="0.01"
                  min="0"
                  prepend-inner-icon="mdi-trending-up"
                  variant="outlined"
                  density="comfortable"
                  hint="Bénéfice que vous souhaitez réaliser"
                  persistent-hint
                ></v-text-field>
                <div class="mt-1 text-caption text-medium-emphasis d-flex align-center">
                  <v-icon size="small" class="mr-1" color="success">mdi-trending-up</v-icon>
                  <span>Bénéfice: {{ newOrder.profit ? newOrder.profit.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ¥</span>
                </div>
              </v-col>
              <v-col cols="12">
                <v-card color="success" variant="tonal" class="d-flex align-center">
                  <v-card-text class="pa-4 w-100">
                    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" color="success" size="large">mdi-calculator</v-icon>
                        <div>
                          <div class="text-caption text-medium-emphasis">Coût total estimé</div>
                          <div class="text-h5 font-weight-bold">
                            {{ calculateOrderTotalCost() }}
                          </div>
                        </div>
                      </div>
                      <div class="d-flex flex-column align-end text-right">
                        <div class="text-caption text-medium-emphasis mb-1">Détails du calcul</div>
                        <div class="text-body-2" v-if="orderInputMode === 'price'">
                          {{ newOrder.quantity || 0 }} × {{ newOrder.priceRMB ? newOrder.priceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ¥ × {{ newOrder.exchangeRate ? newOrder.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }}
                          <template v-for="(extra, index) in newOrder.extras" :key="index">
                            <span v-if="extra.amount > 0">
                              <br>+ {{ extra.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥ × {{ newOrder.exchangeRate ? newOrder.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }}
                              <span v-if="extra.description" class="text-caption"> ({{ extra.description }})</span>
                            </span>
                          </template>
                        </div>
                        <div class="text-body-2" v-else>
                          {{ newOrder.totalCostMGA ? formatCurrency(newOrder.totalCostMGA) : '0 MGA' }} ÷ {{ newOrder.exchangeRate ? newOrder.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ÷ {{ newOrder.quantity || 0 }} = {{ calculatedPriceRMB ? calculatedPriceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ¥
                          <template v-for="(extra, index) in newOrder.extras" :key="index">
                            <span v-if="extra.amount > 0">
                              <br>+ Extra: {{ extra.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥ × {{ newOrder.exchangeRate ? newOrder.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }}
                              <span v-if="extra.description" class="text-caption"> ({{ extra.description }})</span>
                            </span>
                          </template>
                        </div>
                      </div>
                    </div>
                    <v-divider class="my-3"></v-divider>
                    <div v-if="orderInputMode === 'total' && calculatedPriceRMB" class="d-flex align-center justify-space-between mb-2">
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" color="orange" size="small">mdi-currency-cny</v-icon>
                        <span class="text-body-1">Prix d'achat calculé (RMB):</span>
                      </div>
                      <span class="text-h6 font-weight-bold">{{ calculatedPriceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥</span>
                    </div>
                    <div v-if="recommendedPurchasePrice > 0" class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" color="primary" size="small">mdi-lightbulb-on</v-icon>
                        <span class="text-body-1 font-weight-medium">Prix d'achat recommandé (RMB):</span>
                      </div>
                      <span class="text-h6 font-weight-bold text-primary">{{ recommendedPurchasePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥</span>
                    </div>
                    <div v-if="recommendedSalePrice > 0" class="d-flex align-center justify-space-between mt-2">
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" color="info" size="small">mdi-tag</v-icon>
                        <span class="text-body-1 font-weight-medium">Prix de vente recommandé (MGA):</span>
                      </div>
                      <span class="text-h6 font-weight-bold text-info">{{ formatCurrency(recommendedSalePrice) }}</span>
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
            @click="showOrderDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="info"
            prepend-icon="mdi-check"
            @click="createOrder"
            :loading="loading"
          >
            Créer la commande
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour afficher les détails du coût total estimé -->
    <v-dialog v-model="showDetailsDialog" max-width="800" persistent scrollable>
      <v-card>
        <v-card-title class="text-white bg-info pa-6">
          <v-icon class="mr-3" size="28">mdi-information</v-icon>
          <span class="text-h5 font-weight-bold">Détails complets de l'achat</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <div v-if="selectedPurchase">
            <v-row>
              <!-- Informations du produit -->
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
                    Informations du produit
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="primary" size="small">mdi-tag</v-icon>
                          <strong class="mr-2">Nom:</strong>
                          <span>{{ selectedPurchase.product?.name || 'N/A' }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.description" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="grey" size="small">mdi-text-box</v-icon>
                          <strong class="mr-2">Description:</strong>
                          <span>{{ selectedPurchase.product.description }}</span>
                        </div>
                        <div class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="primary" size="small">mdi-numeric</v-icon>
                          <strong class="mr-2">Quantité achetée:</strong>
                          <span class="text-h6 font-weight-bold">{{ selectedPurchase.quantity }}</span>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <!-- Attributs spécifiques du produit -->
                        <div v-if="selectedPurchase.product?.model" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="info" size="small">mdi-cellphone-link</v-icon>
                          <strong class="mr-2">Modèle:</strong>
                          <span>{{ selectedPurchase.product.model }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.color" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="purple" size="small">mdi-palette</v-icon>
                          <strong class="mr-2">Couleur:</strong>
                          <span>{{ selectedPurchase.product.color }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.storage" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="orange" size="small">mdi-harddisk</v-icon>
                          <strong class="mr-2">Stockage:</strong>
                          <span>{{ selectedPurchase.product.storage }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.ram" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="blue" size="small">mdi-memory</v-icon>
                          <strong class="mr-2">RAM:</strong>
                          <span>{{ selectedPurchase.product.ram }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.processor" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="green" size="small">mdi-chip</v-icon>
                          <strong class="mr-2">Processeur:</strong>
                          <span>{{ selectedPurchase.product.processor }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.screenSize" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="teal" size="small">mdi-monitor</v-icon>
                          <strong class="mr-2">Taille d'écran:</strong>
                          <span>{{ selectedPurchase.product.screenSize }}</span>
                        </div>
                        <div v-if="selectedPurchase.product?.battery" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="red" size="small">mdi-battery</v-icon>
                          <strong class="mr-2">Batterie:</strong>
                          <span>{{ selectedPurchase.product.battery }}%</span>
                        </div>
                        <div v-if="selectedPurchase.product?.condition" class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="amber" size="small">mdi-check-circle</v-icon>
                          <strong class="mr-2">État:</strong>
                          <span>{{ selectedPurchase.product.condition }}</span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Calcul du coût total -->
              <v-col cols="12">
                <v-card color="success" variant="tonal">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2" color="success">mdi-calculator</v-icon>
                    Calcul du coût total
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" color="orange" size="small">mdi-currency-cny</v-icon>
                            <span>Prix d'achat unitaire (RMB):</span>
                          </div>
                          <span class="text-h6 font-weight-bold">
                            {{ selectedPurchase.priceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥
                          </span>
                        </div>
                        
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" color="info" size="small">mdi-currency-exchange</v-icon>
                            <span>Taux de change:</span>
                          </div>
                          <span class="text-h6 font-weight-bold">
                            {{ selectedPurchase.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                          </span>
                        </div>
                        
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" color="primary" size="small">mdi-numeric</v-icon>
                            <span>Quantité:</span>
                          </div>
                          <span class="text-h6 font-weight-bold">
                            {{ selectedPurchase.quantity }}
                          </span>
                        </div>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <!-- Calculs dérivés -->
                        <v-card variant="outlined" class="mb-3">
                          <v-card-text>
                            <div class="text-caption text-medium-emphasis mb-2">Coût unitaire</div>
                            <div class="d-flex align-center justify-space-between mb-2">
                              <span>En RMB:</span>
                              <span class="font-weight-bold">
                                {{ selectedPurchase.priceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥
                              </span>
                            </div>
                            <div class="d-flex align-center justify-space-between">
                              <span>En MGA:</span>
                              <span class="font-weight-bold text-success">
                                {{ formatCurrency(selectedPurchase.priceRMB * selectedPurchase.exchangeRate) }}
                              </span>
                            </div>
                          </v-card-text>
                        </v-card>
                        
                        <v-card variant="outlined">
                          <v-card-text>
                            <div class="text-caption text-medium-emphasis mb-2">Coût total</div>
                            <div class="d-flex align-center justify-space-between">
                              <span class="text-body-1">Total (MGA):</span>
                              <span class="text-h5 font-weight-bold text-success">
                                {{ formatCurrency(selectedPurchase.totalCostMGA) }}
                              </span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    
                    <v-divider class="my-3"></v-divider>
                    
                    <div class="text-center mb-3">
                      <div class="text-caption text-medium-emphasis mb-2">Formule de calcul:</div>
                      <div class="text-body-1 font-weight-medium mb-2">
                        Prix unitaire (RMB) × Taux de change × Quantité = Coût total (MGA)
                      </div>
                      <div class="text-body-2">
                        {{ selectedPurchase.priceRMB.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ¥
                        × {{ selectedPurchase.exchangeRate.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                        × {{ selectedPurchase.quantity }}
                        = {{ formatCurrency(selectedPurchase.totalCostMGA) }}
                      </div>
                    </div>
                    
                    <v-divider class="my-3"></v-divider>
                    
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon class="mr-2" color="success" size="large">mdi-cash</v-icon>
                        <span class="text-h6 font-weight-bold">Coût total estimé:</span>
                      </div>
                      <span class="text-h4 font-weight-bold text-success">
                        {{ formatCurrency(selectedPurchase.totalCostMGA) }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Marge de bénéfice -->
              <v-col cols="12">
                <v-card color="primary" variant="tonal">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
                    Analyse de rentabilité
                    <v-progress-circular
                      v-if="loadingProfit"
                      indeterminate
                      size="20"
                      width="2"
                      class="ml-2"
                    ></v-progress-circular>
                  </v-card-title>
                  <v-card-text v-if="loadingProfit" class="text-center pa-4">
                    <div class="text-body-2 text-medium-emphasis">Chargement des données de rentabilité...</div>
                  </v-card-text>
                  <v-card-text v-else-if="productProfit">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" color="success" size="small">mdi-cash-multiple</v-icon>
                            <span>Revenu total (MGA):</span>
                          </div>
                          <span class="text-h6 font-weight-bold text-success">
                            {{ formatCurrency(productProfit.totalRevenue || 0) }}
                          </span>
                        </div>
                        
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" color="orange" size="small">mdi-cash-minus</v-icon>
                            <span>Coût total (MGA):</span>
                          </div>
                          <span class="text-h6 font-weight-bold text-orange">
                            {{ formatCurrency(productProfit.totalCost || selectedPurchase.totalCostMGA) }}
                          </span>
                        </div>
                        
                        <div class="d-flex align-center justify-space-between">
                          <div class="d-flex align-center">
                            <v-icon class="mr-2" :color="(productProfit.profit || 0) >= 0 ? 'success' : 'error'" size="small">
                              {{ (productProfit.profit || 0) >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                            </v-icon>
                            <span>Bénéfice/Perte (MGA):</span>
                          </div>
                          <span class="text-h6 font-weight-bold" :class="(productProfit.profit || 0) >= 0 ? 'text-success' : 'text-error'">
                            {{ formatCurrency(productProfit.profit || 0) }}
                          </span>
                        </div>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-card variant="outlined" class="mb-3">
                          <v-card-text>
                            <div class="text-caption text-medium-emphasis mb-2">Marge de bénéfice</div>
                            <div class="d-flex align-center justify-space-between mb-2">
                              <span>Pourcentage:</span>
                              <span class="text-h5 font-weight-bold" :class="(productProfit.profitMargin || 0) >= 0 ? 'text-success' : 'text-error'">
                                {{ (productProfit.profitMargin || 0).toFixed(2) }}%
                              </span>
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              {{ productProfit.profitMargin >= 0 ? 'Marge positive' : 'Marge négative' }}
                            </div>
                          </v-card-text>
                        </v-card>
                        
                        <v-card variant="outlined">
                          <v-card-text>
                            <div class="text-caption text-medium-emphasis mb-2">Statistiques produit</div>
                            <div class="d-flex align-center justify-space-between mb-1">
                              <span class="text-caption">Acheté:</span>
                              <span class="font-weight-bold">{{ productProfit.totalPurchased || 0 }}</span>
                            </div>
                            <div class="d-flex align-center justify-space-between mb-1">
                              <span class="text-caption">Vendu:</span>
                              <span class="font-weight-bold">{{ productProfit.totalSold || 0 }}</span>
                            </div>
                            <div class="d-flex align-center justify-space-between">
                              <span class="text-caption">Stock:</span>
                              <span class="font-weight-bold" :class="(productProfit.stock || 0) > 0 ? 'text-success' : 'text-warning'">
                                {{ productProfit.stock || 0 }}
                              </span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-card-text v-else class="text-center pa-4">
                    <div class="text-body-2 text-medium-emphasis">
                      <v-icon class="mr-2" color="grey">mdi-information</v-icon>
                      Aucune donnée de vente disponible pour calculer la marge de bénéfice
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Informations de date et métadonnées -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2" color="grey">mdi-calendar-clock</v-icon>
                    Informations de date
                  </v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="d-flex align-center mb-2">
                          <v-icon class="mr-2" color="info" size="small">mdi-calendar</v-icon>
                          <strong class="mr-2">Date d'achat:</strong>
                          <span>{{ formatDate(selectedPurchase.purchaseDate) }}</span>
                        </div>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2" color="grey" size="small">mdi-clock-outline</v-icon>
                          <strong class="mr-2">Heure d'achat:</strong>
                          <span>{{ formatDateTime(selectedPurchase.purchaseDate) }}</span>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-caption text-medium-emphasis mb-2">Informations techniques</div>
                        <div class="d-flex align-center mb-1">
                          <v-icon class="mr-2" color="grey" size="small">mdi-identifier</v-icon>
                          <span class="text-caption">ID: {{ selectedPurchase.id.substring(0, 8) }}...</span>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="info"
            prepend-icon="mdi-close"
            @click="showDetailsDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  purchasesApi,
  ordersApi,
  productsApi,
  exchangeRatesApi,
  type Purchase,
  type Product,
  type ExchangeRate,
} from '@/api/client'

const purchases = ref<Purchase[]>([])
const products = ref<Product[]>([])
const activeExchangeRate = ref<ExchangeRate | null>(null)
const showDialog = ref(false)
const showOrderDialog = ref(false)
const showOrderModeDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedPurchase = ref<Purchase | null>(null)
const productProfit = ref<any>(null)
const loadingProfit = ref(false)
const orderInputMode = ref<'price' | 'total'>('price')
const loading = ref(false)
const purchaseForm = ref<any>(null)
const orderForm = ref<any>(null)
const newOrder = ref({
  productId: '',
  quantity: 1,
  priceRMB: 0,
  totalCostMGA: 0,
  exchangeRate: 0,
  extras: [] as Array<{ amount: number; description: string }>,
  profit: 0,
  orderDate: new Date().toISOString().split('T')[0],
})
const newPurchase = ref({
  productId: '',
  quantity: 1,
  priceRMB: 0,
  exchangeRate: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
})

const headers = [
  { title: 'Produit', key: 'product' },
  { title: 'Quantité', key: 'quantity' },
  { title: 'Prix (RMB)', key: 'priceRMB' },
  { title: 'Taux de change', key: 'exchangeRate' },
  { title: 'Coût total (MGA)', key: 'totalCostMGA' },
  { title: 'Date', key: 'purchaseDate' },
  { title: 'Actions', key: 'actions', sortable: false, width: '100px' },
]

const loadData = async () => {
  loading.value = true
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
    
    // Si mode coût total, calculer le prix d'achat en RMB
    let orderData: any = { ...newOrder.value }
    if (orderInputMode.value === 'total') {
      orderData.priceRMB = calculatedPriceRMB.value
    }
    // Exclure totalCostMGA et extras avant l'envoi (extras ne sont pas dans le modèle Order)
    const { totalCostMGA, extras, ...orderPayload } = orderData
    await ordersApi.create(orderPayload)
    newOrder.value = {
      productId: '',
      quantity: 1,
      priceRMB: 0,
      totalCostMGA: 0,
      exchangeRate: activeExchangeRate.value?.rate || 0,
      extras: [],
      profit: 0,
      orderDate: new Date().toISOString().split('T')[0],
    }
    orderInputMode.value = 'price'
    showOrderDialog.value = false
    // Rediriger vers la page des commandes ou recharger les données
    window.location.href = '/orders'
  } catch (error) {
    console.error('Error creating order:', error)
  } finally {
    loading.value = false
  }
}

const calculatedPriceRMB = computed(() => {
  if (orderInputMode.value === 'total') {
    const totalCostMGA = newOrder.value.totalCostMGA || 0
    const exchangeRate = newOrder.value.exchangeRate || 0
    const quantity = newOrder.value.quantity || 0
    if (exchangeRate > 0 && quantity > 0) {
      return totalCostMGA / exchangeRate / quantity
    }
  }
  return 0
})

// Total des extras en RMB
const totalExtrasRMB = computed(() => {
  return newOrder.value.extras.reduce((sum, extra) => sum + (extra.amount || 0), 0)
})

// Prix d'achat recommandé basé sur le coût total, extra et bénéfice
const recommendedPurchasePrice = computed(() => {
  const totalCostMGA = orderInputMode.value === 'total' 
    ? (newOrder.value.totalCostMGA || 0)
    : calculateOrderTotalCostValue()
  const profitRMB = newOrder.value.profit || 0
  const exchangeRate = newOrder.value.exchangeRate || 0
  const quantity = newOrder.value.quantity || 0
  
  if (exchangeRate > 0 && quantity > 0 && totalCostMGA > 0) {
    // Convertir tous les extras et profit en MGA, puis soustraire du coût total
    const totalExtrasMGA = totalExtrasRMB.value * exchangeRate
    const profitMGA = profitRMB * exchangeRate
    // Prix d'achat recommandé = (Coût total - Extras en MGA - Bénéfice en MGA) / (Taux de change × Quantité)
    const baseCost = totalCostMGA - totalExtrasMGA - profitMGA
    if (baseCost > 0) {
      return baseCost / exchangeRate / quantity
    }
  }
  return 0
})

// Prix de vente recommandé
const recommendedSalePrice = computed(() => {
  const totalCostMGA = orderInputMode.value === 'total' 
    ? (newOrder.value.totalCostMGA || 0)
    : calculateOrderTotalCostValue()
  const profitRMB = newOrder.value.profit || 0
  const exchangeRate = newOrder.value.exchangeRate || 0
  
  if (totalCostMGA > 0 && exchangeRate > 0) {
    // Convertir tous les extras et profit en MGA, puis ajouter au coût total
    const totalExtrasMGA = totalExtrasRMB.value * exchangeRate
    const profitMGA = profitRMB * exchangeRate
    // Prix de vente = Coût total + Extras en MGA + Bénéfice en MGA
    return totalCostMGA + totalExtrasMGA + profitMGA
  }
  return 0
})

const calculateOrderTotalCostValue = () => {
  const quantity = newOrder.value.quantity || 0
  const priceRMB = newOrder.value.priceRMB || 0
  const exchangeRate = newOrder.value.exchangeRate || 0
  const totalExtrasMGA = totalExtrasRMB.value * exchangeRate
  return (quantity * priceRMB * exchangeRate) + totalExtrasMGA
}

const calculateOrderTotalCost = () => {
  if (orderInputMode.value === 'price') {
    const quantity = newOrder.value.quantity || 0
    const priceRMB = newOrder.value.priceRMB || 0
    const exchangeRate = newOrder.value.exchangeRate || 0
    const totalExtrasMGA = totalExtrasRMB.value * exchangeRate
    const total = (quantity * priceRMB * exchangeRate) + totalExtrasMGA
    return total > 0 ? formatCurrency(total) : '0 MGA'
  } else {
    const totalCostMGA = newOrder.value.totalCostMGA || 0
    const exchangeRate = newOrder.value.exchangeRate || 0
    const totalExtrasMGA = totalExtrasRMB.value * exchangeRate
    return (totalCostMGA + totalExtrasMGA) > 0 ? formatCurrency(totalCostMGA + totalExtrasMGA) : '0 MGA'
  }
}

const createPurchase = async () => {
  const { valid } = await purchaseForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await purchasesApi.create(newPurchase.value)
    newPurchase.value = {
      productId: '',
      quantity: 1,
      priceRMB: 0,
      exchangeRate: activeExchangeRate.value?.rate || 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    }
    showDialog.value = false
    loadData()
  } catch (error) {
    console.error('Error creating purchase:', error)
  } finally {
    loading.value = false
  }
}

const addExtra = () => {
  newOrder.value.extras.push({
    amount: 0,
    description: '',
  })
}

const removeExtra = (index: number) => {
  newOrder.value.extras.splice(index, 1)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
  }).format(value)
}

const calculateTotalCost = () => {
  const quantity = newPurchase.value.quantity || 0
  const priceRMB = newPurchase.value.priceRMB || 0
  const exchangeRate = newPurchase.value.exchangeRate || 0
  const total = quantity * priceRMB * exchangeRate
  return total > 0 ? formatCurrency(total) : '0 MGA'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showPurchaseDetails = async (purchase: Purchase) => {
  selectedPurchase.value = purchase
  showDetailsDialog.value = true
  productProfit.value = null
  loadingProfit.value = true
  
  // Charger les données de profit du produit si disponible
  if (purchase.productId) {
    try {
      const profitRes = await productsApi.getProfit(purchase.productId)
      const profit = profitRes.data
      // Calculer la marge bénéficiaire
      const profitMargin = profit.totalRevenue > 0
        ? ((profit.profit / profit.totalRevenue) * 100)
        : 0
      productProfit.value = {
        ...profit,
        profitMargin
      }
    } catch (error) {
      console.error('Error loading product profit:', error)
      // Continuer même si le profit ne peut pas être chargé
    } finally {
      loadingProfit.value = false
    }
  }
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