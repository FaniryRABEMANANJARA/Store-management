<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="primary" size="small">mdi-package-variant</v-icon>
          Produits
        </h1>
        <v-btn color="primary" @click="showCreateDialog = true" class="d-sm-inline-block w-100 w-sm-auto" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
          <v-icon class="mr-2" size="small">mdi-plus</v-icon>
          Ajouter un produit
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex flex-column flex-sm-row gap-3">
            <span>Liste des Produits</span>
            <v-spacer></v-spacer>
            <v-btn
              v-if="hasActiveFilters"
              icon="mdi-filter-off"
              size="small"
              variant="text"
              color="error"
              @click="resetFilters"
              title="Réinitialiser les filtres"
            ></v-btn>
          </v-card-title>
          <v-card-text>
            <!-- Barre de recherche et filtres -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="filters.search"
                  label="Rechercher"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.categoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Catégorie"
                  prepend-inner-icon="mdi-folder"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="filters.dateFrom"
                  label="Date début"
                  type="date"
                  prepend-inner-icon="mdi-calendar-start"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="filters.dateTo"
                  label="Date fin"
                  type="date"
                  prepend-inner-icon="mdi-calendar-end"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-data-table
              :headers="headers"
              :items="products"
              :loading="loading"
              :items-per-page="pagination.limit.value"
              :page="pagination.page.value"
              :server-items-length="pagination.total.value"
              @update:page="(page: number) => pagination.goToPage(page)"
              @update:items-per-page="(limit: number) => pagination.setLimit(limit)"
              item-key="id"
              class="elevation-0"
              :height="600"
              virtual
            >
              <template v-slot:item.category.name="{ item }">
                {{ item.category?.name || '-' }}
              </template>
              <template v-slot:item.subCategory.name="{ item }">
                {{ item.subCategory?.name || '-' }}
              </template>
              <template v-slot:item.model="{ item }">
                {{ item.model || '-' }}
              </template>
              <template v-slot:item.color="{ item }">
                <v-chip size="small" :color="item.color ? 'primary' : 'grey'">
                  {{ item.color || '-' }}
                </v-chip>
              </template>
              <template v-slot:item.storage="{ item }">
                {{ item.storage || '-' }}
              </template>
              <template v-slot:item.condition="{ item }">
                <v-chip
                  size="small"
                  :color="getConditionColor(item.condition)"
                >
                  {{ getConditionLabel(item.condition) }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-eye"
                  color="info"
                  size="small"
                  variant="text"
                  @click="showProductDetails(item.id)"
                  title="Voir les détails"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  color="warning"
                  size="small"
                  variant="text"
                  @click="editProduct(item)"
                  title="Modifier"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  size="small"
                  variant="text"
                  @click="deleteProduct(item.id)"
                  title="Supprimer"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog pour créer un produit -->
    <v-dialog v-model="showCreateDialog" max-width="900" persistent scrollable>                                                                                                                                                                                                           
      <v-card class="overflow-hidden">
        <v-card-title class="text-white bg-primary pa-6">
          <v-icon class="mr-3" size="28">mdi-package-variant-plus</v-icon>
          <span class="text-h5 font-weight-bold">Nouveau Produit</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="createForm" @submit.prevent="createProduct">
            <v-row>
              <!-- Catégorie -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="newProduct.categoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Catégorie *"
                  prepend-inner-icon="mdi-folder"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'La catégorie est requise']"
                  @update:model-value="onCategoryChange"
                  required
                >
                  <template v-slot:append-item>
                    <v-divider></v-divider>
                    <v-list-item
                      prepend-icon="mdi-folder-plus"
                      title="Gérer les catégories"
                      to="/categories"
                      class="text-primary"
                    ></v-list-item>
                  </template>
                </v-select>
              </v-col>
              
              <!-- Sous-catégorie -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="newProduct.subCategoryId"
                  :items="filteredSubCategories"
                  item-title="name"
                  item-value="id"
                  label="Sous-catégorie"
                  prepend-inner-icon="mdi-folder-outline"
                  variant="outlined"
                  density="comfortable"
                  :disabled="!newProduct.categoryId"
                  clearable
                ></v-select>
              </v-col>

              <!-- Nom du produit -->
              <v-col cols="12">
                <v-text-field
                  v-model="newProduct.name"
                  label="Nom du produit *"
                  placeholder="Ex: iPhone 15 Pro Max"
                  required
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Le nom est requis']"
                ></v-text-field>
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="newProduct.description"
                  label="Description"
                  placeholder="Décrivez le produit..."
                  rows="3"
                  prepend-inner-icon="mdi-text-box-outline"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                ></v-textarea>
              </v-col>

              <!-- Champs dynamiques selon la catégorie -->
              <template v-for="field in dynamicFields" :key="field.key">
                <v-col v-if="field.type === 'text'" :cols="field.cols || 12" :md="field.md || 6">
                  <v-text-field
                    v-model="(newProduct as any)[field.key]"
                    :label="field.label"
                    :placeholder="field.placeholder"
                    :prepend-inner-icon="field.icon"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col v-else-if="field.type === 'select'" :cols="field.cols || 12" :md="field.md || 6">
                  <v-select
                    v-model="(newProduct as any)[field.key]"
                    :items="field.items"
                    :item-title="field.itemTitle || 'text'"
                    :item-value="field.itemValue || 'value'"
                    :label="field.label"
                    :prepend-inner-icon="field.icon"
                    variant="outlined"
                    density="comfortable"
                    :clearable="field.clearable !== false"
                  ></v-select>
                </v-col>
              </template>

              <!-- État -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="newProduct.condition"
                  :items="conditionOptions"
                  item-title="text"
                  item-value="value"
                  label="État"
                  prepend-inner-icon="mdi-check-circle"
                  variant="outlined"
                  density="comfortable"
                  clearable
                ></v-select>
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
            color="primary"
            prepend-icon="mdi-check"
            @click="createProduct"
            :loading="loading"
          >
            Créer le produit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour voir les détails d'un produit -->
    <v-dialog v-model="showDetailsDialog" max-width="700" scrollable>
      <v-card v-if="selectedProduct" class="overflow-hidden">
        <v-card-title class="text-white bg-info pa-6 d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="mr-3" size="28">mdi-information</v-icon>
            <span class="text-h5 font-weight-bold">Détails du Produit</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="showDetailsDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-3" color="primary" size="24">mdi-package-variant</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Nom du produit</div>
                      <div class="text-h6 font-weight-bold">{{ selectedProduct.name }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-start mb-2">
                    <v-icon class="mr-3 mt-1" color="primary" size="24">mdi-text-box-outline</v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Description</div>
                      <div class="text-body-1">{{ selectedProduct.description || 'Aucune description' }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <!-- Catégorie et Sous-catégorie -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="primary" size="24">mdi-folder</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Catégorie</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.category?.name || '-' }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="primary" size="24">mdi-folder-outline</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Sous-catégorie</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.subCategory?.name || '-' }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Attributs du produit -->
            <v-col cols="12" md="6" v-if="selectedProduct.model">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="info" size="24">mdi-cellphone</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Modèle</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.model }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.color">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="purple" size="24">mdi-palette</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Couleur</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.color }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.storage">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="orange" size="24">mdi-harddisk</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Stockage</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.storage }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.battery">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="green" size="24">mdi-battery</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Batterie</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.battery }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.simType">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="blue" size="24">mdi-sim</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Type de SIM</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ selectedProduct?.simType ? (simTypeOptions.find(opt => opt.value === selectedProduct?.simType)?.text || selectedProduct?.simType) : '-' }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.condition">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" :color="getConditionColor(selectedProduct.condition)" size="24">mdi-check-circle</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">État</div>
                      <div class="text-body-2 font-weight-medium">{{ getConditionLabel(selectedProduct.condition) }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Attributs spécifiques aux ordinateurs -->
            <v-col cols="12" md="6" v-if="selectedProduct.ram">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="indigo" size="24">mdi-memory</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">RAM</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.ram }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.processor">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="teal" size="24">mdi-chip</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Processeur</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.processor }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.screenSize">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="cyan" size="24">mdi-monitor</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Taille d'écran</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.screenSize }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedProduct.graphics">
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="deep-purple" size="24">mdi-gpu</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Carte graphique</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedProduct.graphics }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="success" size="24">mdi-calendar-plus</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Date de création</div>
                      <div class="text-body-2 font-weight-medium">{{ formatDate(selectedProduct.createdAt) }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="warning" size="24">mdi-calendar-edit</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Dernière modification</div>
                      <div class="text-body-2 font-weight-medium">{{ formatDate(selectedProduct.updatedAt) }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <v-divider class="my-6"></v-divider>
          
          <div v-if="productDetails">
            <h3 class="text-h6 mb-4">
              <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
              Statistiques
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-card color="success" dark class="elevation-4">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption opacity-75">Total Achats</div>
                        <div class="text-h4 font-weight-bold mt-1">{{ productDetails.purchases?.length || 0 }}</div>
                      </div>
                      <v-icon size="48" class="opacity-50">mdi-cart-arrow-down</v-icon>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="info" dark class="elevation-4">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <div class="text-caption opacity-75">Total Ventes</div>
                        <div class="text-h4 font-weight-bold mt-1">{{ productDetails.sales?.length || 0 }}</div>
                      </div>
                      <v-icon size="48" class="opacity-50">mdi-cart-arrow-up</v-icon>
                    </div>
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
            color="primary"
            prepend-icon="mdi-close"
            @click="showDetailsDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour éditer un produit -->
    <v-dialog v-model="showEditDialog" max-width="900" persistent scrollable>
      <v-card v-if="editingProduct" class="overflow-hidden">
        <v-card-title class="text-white bg-warning pa-6">
          <v-icon class="mr-3" size="28">mdi-pencil-box</v-icon>
          <span class="text-h5 font-weight-bold">Modifier le Produit</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="editForm" @submit.prevent="updateProduct">
            <v-row>
              <!-- Catégorie -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingProduct.categoryId"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="Catégorie *"
                  prepend-inner-icon="mdi-folder"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'La catégorie est requise']"
                  @update:model-value="onCategoryChangeEdit"
                  required
                >
                  <template v-slot:append-item>
                    <v-divider></v-divider>
                    <v-list-item
                      prepend-icon="mdi-folder-plus"
                      title="Gérer les catégories"
                      to="/categories"
                      class="text-primary"
                    ></v-list-item>
                  </template>
                </v-select>
              </v-col>
              
              <!-- Sous-catégorie -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingProduct.subCategoryId"
                  :items="filteredSubCategoriesEdit"
                  item-title="name"
                  item-value="id"
                  label="Sous-catégorie"
                  prepend-inner-icon="mdi-folder-outline"
                  variant="outlined"
                  density="comfortable"
                  :disabled="!editingProduct.categoryId"
                  clearable
                ></v-select>
              </v-col>

              <!-- Nom du produit -->
              <v-col cols="12">
                <v-text-field
                  v-model="editingProduct.name"
                  label="Nom du produit *"
                  required
                  prepend-inner-icon="mdi-package-variant"
                  variant="outlined"
                  density="comfortable"
                  :rules="[v => !!v || 'Le nom est requis']"
                ></v-text-field>
              </v-col>

              <!-- Description -->
              <v-col cols="12">
                <v-textarea
                  v-model="editingProduct.description"
                  label="Description"
                  rows="3"
                  prepend-inner-icon="mdi-text-box-outline"
                  variant="outlined"
                  density="comfortable"
                  auto-grow
                ></v-textarea>
              </v-col>

              <!-- Champs dynamiques selon la catégorie (édition) -->
              <template v-for="field in dynamicFieldsEdit" :key="field.key">
                <v-col v-if="field.type === 'text'" :cols="field.cols || 12" :md="field.md || 6">
                  <v-text-field
                    v-model="(editingProduct as any)[field.key]"
                    :label="field.label"
                    :placeholder="field.placeholder"
                    :prepend-inner-icon="field.icon"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                <v-col v-else-if="field.type === 'select'" :cols="field.cols || 12" :md="field.md || 6">
                  <v-select
                    v-model="(editingProduct as any)[field.key]"
                    :items="field.items"
                    :item-title="field.itemTitle || 'text'"
                    :item-value="field.itemValue || 'value'"
                    :label="field.label"
                    :prepend-inner-icon="field.icon"
                    variant="outlined"
                    density="comfortable"
                    :clearable="field.clearable !== false"
                  ></v-select>
                </v-col>
              </template>

              <!-- État -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingProduct.condition"
                  :items="conditionOptions"
                  item-title="text"
                  item-value="value"
                  label="État"
                  prepend-inner-icon="mdi-check-circle"
                  variant="outlined"
                  density="comfortable"
                  clearable
                ></v-select>
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
            @click="updateProduct"
            :loading="loading"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Snackbar pour les notifications -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    location="top right"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
      <span>{{ snackbar.message }}</span>
    </div>
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="snackbar.show = false"
      >
        Fermer
      </v-btn>
    </template>
  </v-snackbar>

  <!-- Dialog de confirmation pour la suppression -->
  <v-dialog v-model="showDeleteConfirmDialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="text-h6 bg-error text-white pa-4">
        <v-icon class="mr-2">mdi-alert</v-icon>
        Confirmer la suppression
      </v-card-title>
      <v-card-text class="pa-4">
        <p class="text-body-1">{{ deleteConfirmMessage }}</p>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="outlined"
          @click="showDeleteConfirmDialog = false"
        >
          Annuler
        </v-btn>
        <v-btn
          color="error"
          @click="confirmDelete"
          :loading="loading"
        >
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { productsApi, categoriesApi, subCategoriesApi, type Product, type Category, type SubCategory } from '@/api/client'
import { useTableFilters } from '@/composables/useTableFilters'
import { usePagination } from '@/composables/usePagination'
import { clientCache } from '@/composables/useCache'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const subCategories = ref<SubCategory[]>([])
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const showEditDialog = ref(false)
const loading = ref(false)
const   selectedProduct = ref<Product | null>(null)
const productDetails = ref<any>(null)
const editingProduct = ref<{
  id: string
  name: string
  description: string
  categoryId: string
  subCategoryId?: string
  color?: string
  storage?: string
  model?: string
  battery?: string
  simType?: string
  condition?: string
  ram?: string
  processor?: string
  screenSize?: string
  graphics?: string
} | null>(null)
const newProduct = ref({
  name: '',
  description: '',
  categoryId: '',
  subCategoryId: '',
  color: '',
  storage: '',
  model: '',
  battery: '',
  simType: '',
  condition: '',
  ram: '',
  processor: '',
  screenSize: '',
  graphics: '',
})
const createForm = ref<any>(null)
const editForm = ref<any>(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 4000,
  icon: 'mdi-check-circle',
})

// Dialog de confirmation
const showDeleteConfirmDialog = ref(false)
const deleteConfirmMessage = ref('')
const deleteConfirmCallback = ref<(() => void) | null>(null)

const showSnackbar = (message: string, color: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color,
    timeout: color === 'error' ? 6000 : 4000,
    icon: color === 'success' ? 'mdi-check-circle' : 
          color === 'error' ? 'mdi-alert-circle' : 
          color === 'warning' ? 'mdi-alert' : 'mdi-information',
  }
}

// Options pour les selects (déclarées en premier pour être utilisées dans categoryFieldsConfig)
const storageOptions = [
  '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'
]

const ramOptions = [
  '4GB', '8GB', '16GB', '32GB', '64GB'
]

const screenSizeOptions = [
  '11"', '13"', '14"', '15"', '16"', '17"'
]

const simTypeOptions = [
  { text: 'Dual SIM', value: 'dual_sim' },
  { text: 'eSIM', value: 'esim' },
  { text: 'Dual SIM + eSIM', value: 'dual_sim_esim' },
]

// Configuration des champs dynamiques par catégorie
const categoryFieldsConfig: Record<string, any[]> = {
  'Téléphones': [
    { key: 'model', type: 'text', label: 'Modèle', placeholder: 'Ex: iPhone 15 Pro Max', icon: 'mdi-cellphone', cols: 12, md: 6 },
    { key: 'color', type: 'text', label: 'Couleur', placeholder: 'Ex: Bleu Titanium, Noir, Blanc', icon: 'mdi-palette', cols: 12, md: 6 },
    { key: 'storage', type: 'select', label: 'Stockage', icon: 'mdi-harddisk', items: storageOptions, cols: 12, md: 6 },
    { key: 'battery', type: 'text', label: 'Batterie', placeholder: 'Ex: 4000mAh', icon: 'mdi-battery', cols: 12, md: 6 },
    { key: 'simType', type: 'select', label: 'Type de SIM', icon: 'mdi-sim', items: simTypeOptions, itemTitle: 'text', itemValue: 'value', cols: 12, md: 6 },
  ],
  'Ordinateurs': [
    { key: 'model', type: 'text', label: 'Modèle', placeholder: 'Ex: MacBook Air M2', icon: 'mdi-laptop', cols: 12, md: 6 },
    { key: 'color', type: 'text', label: 'Couleur', placeholder: 'Ex: Gris sidéral, Argent', icon: 'mdi-palette', cols: 12, md: 6 },
    { key: 'storage', type: 'select', label: 'Stockage', icon: 'mdi-harddisk', items: storageOptions, cols: 12, md: 6 },
    { key: 'ram', type: 'select', label: 'RAM', icon: 'mdi-memory', items: ramOptions, cols: 12, md: 6 },
    { key: 'processor', type: 'text', label: 'Processeur', placeholder: 'Ex: M2, M2 Pro, Intel i7', icon: 'mdi-chip', cols: 12, md: 6 },
    { key: 'screenSize', type: 'select', label: 'Taille d\'écran', icon: 'mdi-monitor', items: screenSizeOptions, cols: 12, md: 6 },
    { key: 'graphics', type: 'text', label: 'Carte graphique', placeholder: 'Ex: M2 GPU, NVIDIA RTX 3060', icon: 'mdi-gpu', cols: 12, md: 6 },
  ],
  'Bijoux': [
    { key: 'model', type: 'text', label: 'Modèle', placeholder: 'Ex: Collier en or 18K', icon: 'mdi-necklace', cols: 12, md: 6 },
    { key: 'color', type: 'text', label: 'Couleur/Métal', placeholder: 'Ex: Or, Argent, Platine', icon: 'mdi-palette', cols: 12, md: 6 },
  ],
  'Anniversaire': [
    { key: 'model', type: 'text', label: 'Modèle', placeholder: 'Ex: Bougie chiffre 5, Ballon hélium', icon: 'mdi-cake-variant', cols: 12, md: 6 },
    { key: 'color', type: 'text', label: 'Couleur', placeholder: 'Ex: Rouge, Bleu, Multicolore, Or', icon: 'mdi-palette', cols: 12, md: 6 },
    { key: 'storage', type: 'text', label: 'Taille/Dimensions', placeholder: 'Ex: 30cm, 50cm, Grand, Petit', icon: 'mdi-ruler', cols: 12, md: 6 },
    { key: 'battery', type: 'text', label: 'Type/Spécificité', placeholder: 'Ex: Hélium, LED, Chiffre, Lettre', icon: 'mdi-tag', cols: 12, md: 6 },
  ],
}

// Champs par défaut pour toutes les catégories
const defaultFields = [
  { key: 'model', type: 'text', label: 'Modèle', placeholder: 'Ex: Modèle du produit', icon: 'mdi-tag', cols: 12, md: 6 },
  { key: 'color', type: 'text', label: 'Couleur', placeholder: 'Ex: Couleur du produit', icon: 'mdi-palette', cols: 12, md: 6 },
]

// Champs dynamiques pour le formulaire de création
const dynamicFields = computed(() => {
  if (!newProduct.value.categoryId) return []
  
  const selectedCategory = categories.value.find(cat => cat.id === newProduct.value.categoryId)
  if (!selectedCategory) return defaultFields
  
  // Utiliser fieldConfig depuis la base de données si disponible
  // Sinon, utiliser la configuration codée en dur (fallback)
  if (selectedCategory.fieldConfig && Array.isArray(selectedCategory.fieldConfig) && selectedCategory.fieldConfig.length > 0) {
    return selectedCategory.fieldConfig
  }
  
  // Fallback vers la configuration codée en dur
  return categoryFieldsConfig[selectedCategory.name] || defaultFields
})

// Champs dynamiques pour le formulaire d'édition
const dynamicFieldsEdit = computed(() => {
  if (!editingProduct.value?.categoryId) return []
  
  const selectedCategory = categories.value.find(cat => cat.id === editingProduct.value!.categoryId)
  if (!selectedCategory) return defaultFields
  
  // Utiliser fieldConfig depuis la base de données si disponible
  // Sinon, utiliser la configuration codée en dur (fallback)
  if (selectedCategory.fieldConfig && Array.isArray(selectedCategory.fieldConfig) && selectedCategory.fieldConfig.length > 0) {
    return selectedCategory.fieldConfig
  }
  
  // Fallback vers la configuration codée en dur
  return categoryFieldsConfig[selectedCategory.name] || defaultFields
})

const conditionOptions = [
  { text: 'Neuf', value: 'new' },
  { text: 'Comme neuf', value: 'like_new' },
  { text: 'Reconditionné', value: 'refurbished' },
  { text: 'Occasion', value: 'used' },
]

// Sous-catégories filtrées par catégorie
const filteredSubCategories = computed(() => {
  if (!newProduct.value.categoryId) return []
  return subCategories.value.filter(sub => sub.categoryId === newProduct.value.categoryId)
})

const filteredSubCategoriesEdit = computed(() => {
  if (!editingProduct.value?.categoryId) return []
  return subCategories.value.filter(sub => sub.categoryId === editingProduct.value!.categoryId)
})


const headers = [
  { title: 'Nom', key: 'name' },
  { title: 'Catégorie', key: 'category.name' },
  { title: 'Sous-catégorie', key: 'subCategory.name' },
  { title: 'Modèle', key: 'model' },
  { title: 'Couleur', key: 'color' },
  { title: 'Stockage', key: 'storage' },
  { title: 'État', key: 'condition' },
  { title: 'Date de création', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Système de pagination
const pagination = usePagination(10, 'createdAt', 'desc')

// Système de filtres (pour la recherche locale uniquement maintenant)
const { filters, resetFilters } = useTableFilters<Product>(
  products,
  { storageKey: 'products' }
)

// Vérifier s'il y a des filtres actifs
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.categoryId ||
    filters.value.dateFrom ||
    filters.value.dateTo
  )
})

// Charger les produits avec pagination
const loadProducts = async () => {
  pagination.loading.value = true
  loading.value = true
  try {
    // Générer une clé de cache
    const cacheKey = clientCache.generateKey('products', pagination.paginationParams.value)
    
    // Vérifier le cache
    const cached = clientCache.get<any>(cacheKey)
    if (cached) {
      products.value = cached.data
      pagination.updateFromResult(cached)
      return
    }
    
    const response = await productsApi.getAll(pagination.paginationParams.value)
    if (response.data.pagination) {
      // Format paginé
      products.value = response.data.data
      pagination.updateFromResult(response.data)
      // Mettre en cache (TTL de 2 minutes)
      clientCache.set(cacheKey, response.data, 2 * 60 * 1000)
    } else {
      // Format non paginé (fallback)
      products.value = response.data as any
    }
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
    pagination.loading.value = false
  }
}

// Recharger quand la pagination change
watch(
  () => [pagination.page.value, pagination.limit.value, pagination.sortBy.value, pagination.sortOrder.value],
  () => {
    loadProducts()
  }
)

const loadCategories = async () => {
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadSubCategories = async () => {
  try {
    const response = await subCategoriesApi.getAll()
    subCategories.value = response.data
  } catch (error) {
    console.error('Error loading subcategories:', error)
  }
}

const onCategoryChange = () => {
  // Réinitialiser la sous-catégorie quand la catégorie change
  newProduct.value.subCategoryId = ''
}

const onCategoryChangeEdit = () => {
  // Réinitialiser la sous-catégorie quand la catégorie change
  if (editingProduct.value) {
    editingProduct.value.subCategoryId = ''
  }
}

const createProduct = async () => {
  // Invalider le cache
  clientCache.deleteByPrefix('products')
  const { valid } = await createForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    const productData = {
      name: newProduct.value.name,
      description: newProduct.value.description || undefined,
      categoryId: newProduct.value.categoryId,
      subCategoryId: newProduct.value.subCategoryId || undefined,
      color: newProduct.value.color || undefined,
      storage: newProduct.value.storage || undefined,
      model: newProduct.value.model || undefined,
      battery: newProduct.value.battery || undefined,
      simType: newProduct.value.simType || undefined,
      condition: newProduct.value.condition || undefined,
      ram: newProduct.value.ram || undefined,
      processor: newProduct.value.processor || undefined,
      screenSize: newProduct.value.screenSize || undefined,
      graphics: newProduct.value.graphics || undefined,
    }
    await productsApi.create(productData)
    newProduct.value = {
      name: '',
      description: '',
      categoryId: '',
      subCategoryId: '',
      color: '',
      storage: '',
      model: '',
      battery: '',
      simType: '',
      condition: '',
      ram: '',
      processor: '',
      screenSize: '',
      graphics: '',
    }
    showCreateDialog.value = false
    loadProducts()
    showSnackbar('Produit créé avec succès', 'success')
  } catch (error: any) {
    console.error('Error creating product:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la création du produit', 'error')
  } finally {
    loading.value = false
  }
}

const showProductDetails = async (id: string) => {
  try {
    const response = await productsApi.getById(id)
    selectedProduct.value = response.data
    productDetails.value = response.data
    showDetailsDialog.value = true
  } catch (error) {
    console.error('Error loading product details:', error)
  }
}

const editProduct = (product: Product) => {
  editingProduct.value = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    categoryId: product.categoryId,
    subCategoryId: product.subCategoryId || '',
    color: product.color || '',
    storage: product.storage || '',
    model: product.model || '',
    battery: product.battery || '',
    simType: product.simType || '',
    condition: product.condition || '',
    ram: product.ram || '',
    processor: product.processor || '',
    screenSize: product.screenSize || '',
    graphics: product.graphics || '',
  }
  showEditDialog.value = true
}

const updateProduct = async () => {
  if (!editingProduct.value) return

  const { valid } = await editForm.value?.validate()
  if (!valid) return

  // Invalider le cache
  clientCache.deleteByPrefix('products')

  try {
    loading.value = true
    const productData = {
      name: editingProduct.value.name,
      description: editingProduct.value.description || undefined,
      categoryId: editingProduct.value.categoryId,
      subCategoryId: editingProduct.value.subCategoryId || undefined,
      color: editingProduct.value.color || undefined,
      storage: editingProduct.value.storage || undefined,
      model: editingProduct.value.model || undefined,
      battery: editingProduct.value.battery || undefined,
      simType: editingProduct.value.simType || undefined,
      condition: editingProduct.value.condition || undefined,
      ram: editingProduct.value.ram || undefined,
      processor: editingProduct.value.processor || undefined,
      screenSize: editingProduct.value.screenSize || undefined,
      graphics: editingProduct.value.graphics || undefined,
    }
    await productsApi.update(editingProduct.value.id, productData)
    showEditDialog.value = false
    editingProduct.value = null
    loadProducts()
    showSnackbar('Produit modifié avec succès', 'success')
  } catch (error: any) {
    console.error('Error updating product:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la modification du produit', 'error')
  } finally {
    loading.value = false
  }
}

const deleteProduct = async (id: string) => {
  deleteConfirmMessage.value = 'Êtes-vous sûr de vouloir supprimer ce produit ?'
  deleteConfirmCallback.value = async () => {
    // Invalider le cache
    clientCache.deleteByPrefix('products')
    
    try {
      loading.value = true
      await productsApi.delete(id)
      loadProducts()
      showSnackbar('Produit supprimé avec succès', 'success')
    } catch (error: any) {
      console.error('Error deleting product:', error)
      showSnackbar(error.response?.data?.error || 'Erreur lors de la suppression du produit', 'error')
    } finally {
      loading.value = false
      showDeleteConfirmDialog.value = false
    }
  }
  showDeleteConfirmDialog.value = true
}

const confirmDelete = () => {
  if (deleteConfirmCallback.value) {
    deleteConfirmCallback.value()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getConditionLabel = (condition?: string) => {
  if (!condition) return '-'
  const option = conditionOptions.find(opt => opt.value === condition)
  return option?.text || condition
}

const getConditionColor = (condition?: string) => {
  if (!condition) return 'grey'
  const colors: Record<string, string> = {
    new: 'success',
    like_new: 'info',
    refurbished: 'warning',
    used: 'orange',
  }
  return colors[condition] || 'grey'
}

onMounted(() => {
  loadProducts()
  loadCategories()
  loadSubCategories()
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
