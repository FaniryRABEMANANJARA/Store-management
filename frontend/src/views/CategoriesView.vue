<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="primary" size="small">mdi-folder-multiple</v-icon>
          Catégories et Sous-catégories
        </h1>
        <v-btn color="primary" @click="showCreateCategoryDialog = true" class="d-sm-inline-block w-100 w-sm-auto" :size="$vuetify.display.xs ? 'small' : 'default'" :block="$vuetify.display.xs">
          <v-icon class="mr-2" size="small">mdi-folder-plus</v-icon>
          Ajouter une catégorie
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">Liste des Catégories</v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-expansion-panels v-model="expandedCategories" multiple variant="accordion">
              <v-expansion-panel
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                <v-expansion-panel-title>
                  <div class="d-flex flex-column flex-sm-row align-start align-sm-center w-100 pa-2">
                    <div class="d-flex align-center flex-grow-1 mb-2 mb-sm-0">
                      <v-icon class="mr-3" color="primary" size="28">mdi-folder</v-icon>
                      <div>
                        <div class="text-h6 text-body-1 text-sm-h6 font-weight-bold">{{ category.name }}</div>
                        <div class="text-body-2 text-caption text-grey mt-1">
                          {{ category.description || 'Aucune description' }}
                        </div>
                      </div>
                    </div>
                    <v-chip size="default" color="info" class="align-self-start align-self-sm-center">
                      {{ category.subCategories?.length || 0 }} sous-catégorie(s)
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="d-flex flex-column flex-sm-row gap-2 mb-4 pa-2">
                    <v-btn
                      color="primary"
                      size="x-small"
                      @click="openAddSubCategoryDialog(category)"
                      :block="$vuetify.display.xs"
                      class="d-sm-inline-block"
                    >
                      <v-icon class="mr-2" size="small">mdi-folder-plus</v-icon>
                      Sous-catégorie
                    </v-btn>
                    <v-btn
                      color="warning"
                      size="x-small"
                      class="ml-sm-2 d-sm-inline-block"
                      @click="editCategory(category)"
                      :block="$vuetify.display.xs"
                    >
                      <v-icon class="mr-2" size="small">mdi-pencil</v-icon>
                      Modifier
                    </v-btn>
                    <v-btn
                      color="error"
                      size="x-small"
                      class="ml-sm-2 d-sm-inline-block"
                      @click="deleteCategory(category.id)"
                      :block="$vuetify.display.xs"
                    >
                      <v-icon class="mr-2" size="small">mdi-delete</v-icon>
                      Supprimer
                    </v-btn>
                  </div>

                  <v-list v-if="category.subCategories && category.subCategories.length > 0" class="pa-0">
                    <v-list-item
                      v-for="subCategory in category.subCategories"
                      :key="subCategory.id"
                      class="mb-3 pa-0"
                    >
                      <v-card variant="outlined" class="w-100">
                        <v-card-text class="pa-4">
                          <div class="d-flex flex-column flex-sm-row align-start align-sm-center gap-3">
                            <div class="d-flex align-center flex-grow-1">
                              <v-icon class="mr-3" color="info" size="24">mdi-folder-outline</v-icon>
                              <div class="flex-grow-1">
                                <div class="text-body-1 font-weight-medium text-h6">{{ subCategory.name }}</div>
                                <div class="text-body-2 text-caption text-grey mt-1">
                                  {{ subCategory.description || 'Aucune description' }}
                                </div>
                              </div>
                            </div>
                            <div class="d-flex gap-2 align-self-end align-self-sm-center">
                              <v-btn
                                icon="mdi-pencil"
                                color="warning"
                                size="default"
                                variant="text"
                                @click="editSubCategory(subCategory)"
                              ></v-btn>
                              <v-btn
                                icon="mdi-delete"
                                color="error"
                                size="default"
                                variant="text"
                                @click="deleteSubCategory(subCategory.id)"
                              ></v-btn>
                            </div>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-list-item>
                  </v-list>
                  <v-alert
                    v-else
                    type="info"
                    variant="tonal"
                    density="compact"
                  >
                    Aucune sous-catégorie pour le moment
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog pour créer une catégorie -->
    <v-dialog v-model="showCreateCategoryDialog" max-width="800" persistent scrollable>
      <v-card>
        <v-card-title class="text-white bg-primary pa-6">
          <v-icon class="mr-3" size="28">mdi-folder-plus</v-icon>
          <span class="text-h5 font-weight-bold">Nouvelle Catégorie</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="createCategoryForm" @submit.prevent="createCategory">
            <v-text-field
              v-model="newCategory.name"
              label="Nom de la catégorie *"
              placeholder="Ex: Bijoux, Accessoires"
              required
              prepend-inner-icon="mdi-folder"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Le nom de la catégorie est requis']"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="newCategory.description"
              label="Description"
              placeholder="Décrivez la catégorie..."
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="comfortable"
              auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="cancelCreateCategory"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-check"
            @click="createCategory"
            :loading="loading"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour modifier une catégorie -->
    <v-dialog v-model="showEditCategoryDialog" max-width="800" persistent scrollable>
      <v-card v-if="editingCategory">
        <v-card-title class="text-white bg-warning pa-6">
          <v-icon class="mr-3" size="28">mdi-pencil-box</v-icon>
          <span class="text-h5 font-weight-bold">Modifier la Catégorie</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="editCategoryForm" @submit.prevent="updateCategory">
            <v-text-field
              v-model="editingCategory.name"
              label="Nom de la catégorie *"
              required
              prepend-inner-icon="mdi-folder"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Le nom de la catégorie est requis']"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="editingCategory.description"
              label="Description"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="comfortable"
              auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="showEditCategoryDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-content-save"
            @click="updateCategory"
            :loading="loading"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour ajouter une sous-catégorie -->
    <v-dialog v-model="showAddSubCategoryDialog" max-width="800" persistent scrollable>
      <v-card v-if="selectedCategoryForSub">
        <v-card-title class="text-white bg-info pa-6">
          <v-icon class="mr-3" size="28">mdi-folder-plus</v-icon>
          <span class="text-h5 font-weight-bold">Nouvelle Sous-catégorie</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="addSubCategoryForm" @submit.prevent="createSubCategory">
            <v-text-field
              v-model="newSubCategory.name"
              label="Nom de la sous-catégorie *"
              placeholder="Ex: Colliers, Bracelets"
              required
              prepend-inner-icon="mdi-folder-outline"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Le nom de la sous-catégorie est requis']"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="newSubCategory.description"
              label="Description"
              placeholder="Décrivez la sous-catégorie..."
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="comfortable"
              auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="cancelAddSubCategory"
          >
            Annuler
          </v-btn>
          <v-btn
            color="info"
            prepend-icon="mdi-check"
            @click="createSubCategory"
            :loading="loading"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog pour modifier une sous-catégorie -->
    <v-dialog v-model="showEditSubCategoryDialog" max-width="800" persistent scrollable>
      <v-card v-if="editingSubCategory">
        <v-card-title class="text-white bg-warning pa-6">
          <v-icon class="mr-3" size="28">mdi-pencil-box</v-icon>
          <span class="text-h5 font-weight-bold">Modifier la Sous-catégorie</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="editSubCategoryForm" @submit.prevent="updateSubCategory">
            <v-text-field
              v-model="editingSubCategory.name"
              label="Nom de la sous-catégorie *"
              required
              prepend-inner-icon="mdi-folder-outline"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Le nom de la sous-catégorie est requis']"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="editingSubCategory.description"
              label="Description"
              rows="3"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              density="comfortable"
              auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="outlined"
            prepend-icon="mdi-close"
            @click="showEditSubCategoryDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="warning"
            prepend-icon="mdi-content-save"
            @click="updateSubCategory"
            :loading="loading"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoriesApi, subCategoriesApi, type Category, type SubCategory } from '@/api/client'

const categories = ref<Category[]>([])
const loading = ref(false)
const expandedCategories = ref<string[]>([])

// Dialogs
const showCreateCategoryDialog = ref(false)
const showEditCategoryDialog = ref(false)
const showAddSubCategoryDialog = ref(false)
const showEditSubCategoryDialog = ref(false)

// Forms
const createCategoryForm = ref<any>(null)
const editCategoryForm = ref<any>(null)
const addSubCategoryForm = ref<any>(null)
const editSubCategoryForm = ref<any>(null)

// Data
const newCategory = ref({
  name: '',
  description: '',
})

const editingCategory = ref<Category | null>(null)
const selectedCategoryForSub = ref<Category | null>(null)
const newSubCategory = ref({
  name: '',
  description: '',
})

const editingSubCategory = ref<SubCategory | null>(null)

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

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loading.value = false
  }
}

const createCategory = async () => {
  const { valid } = await createCategoryForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await categoriesApi.create({
      name: newCategory.value.name,
      description: newCategory.value.description || undefined,
    })
    cancelCreateCategory()
    await loadCategories()
    showSnackbar('Catégorie créée avec succès', 'success')
  } catch (error: any) {
    console.error('Error creating category:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la création de la catégorie', 'error')
  } finally {
    loading.value = false
  }
}

const cancelCreateCategory = () => {
  showCreateCategoryDialog.value = false
  newCategory.value = {
    name: '',
    description: '',
  }
  createCategoryForm.value?.resetValidation()
}

const editCategory = (category: Category) => {
  editingCategory.value = { ...category }
  showEditCategoryDialog.value = true
}

const updateCategory = async () => {
  if (!editingCategory.value) return

  const { valid } = await editCategoryForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await categoriesApi.update(editingCategory.value.id, {
      name: editingCategory.value.name,
      description: editingCategory.value.description || undefined,
      fieldConfig: editingCategory.value.fieldConfig,
    })
    showEditCategoryDialog.value = false
    await loadCategories()
    showSnackbar('Catégorie modifiée avec succès', 'success')
  } catch (error: any) {
    console.error('Error updating category:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la modification de la catégorie', 'error')
  } finally {
    loading.value = false
  }
}

const deleteCategory = async (id: string) => {
  deleteConfirmMessage.value = 'Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action ne peut pas être annulée.'
  deleteConfirmCallback.value = async () => {
    try {
      loading.value = true
      await categoriesApi.delete(id)
      await loadCategories()
      showSnackbar('Catégorie supprimée avec succès', 'success')
    } catch (error: any) {
      console.error('Error deleting category:', error)
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression de la catégorie'
      if (error.response?.data?.productCount) {
        showSnackbar(
          `${errorMessage}. Cette catégorie contient ${error.response.data.productCount} produit(s). Veuillez d'abord supprimer ou déplacer ces produits.`,
          'error'
        )
      } else {
        showSnackbar(errorMessage, 'error')
      }
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

const openAddSubCategoryDialog = (category: Category) => {
  selectedCategoryForSub.value = category
  newSubCategory.value = {
    name: '',
    description: '',
  }
  showAddSubCategoryDialog.value = true
}

const cancelAddSubCategory = () => {
  showAddSubCategoryDialog.value = false
  selectedCategoryForSub.value = null
  newSubCategory.value = {
    name: '',
    description: '',
  }
  addSubCategoryForm.value?.resetValidation()
}

const createSubCategory = async () => {
  if (!selectedCategoryForSub.value) return

  const { valid } = await addSubCategoryForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await subCategoriesApi.create({
      name: newSubCategory.value.name,
      description: newSubCategory.value.description || undefined,
      categoryId: selectedCategoryForSub.value.id,
    })
    cancelAddSubCategory()
    await loadCategories()
    showSnackbar('Sous-catégorie créée avec succès', 'success')
  } catch (error: any) {
    console.error('Error creating subcategory:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la création de la sous-catégorie', 'error')
  } finally {
    loading.value = false
  }
}

const editSubCategory = (subCategory: SubCategory) => {
  editingSubCategory.value = { ...subCategory }
  showEditSubCategoryDialog.value = true
}

const updateSubCategory = async () => {
  if (!editingSubCategory.value) return

  const { valid } = await editSubCategoryForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await subCategoriesApi.update(editingSubCategory.value.id, {
      name: editingSubCategory.value.name,
      description: editingSubCategory.value.description || undefined,
      categoryId: editingSubCategory.value.categoryId,
    })
    showEditSubCategoryDialog.value = false
    await loadCategories()
    showSnackbar('Sous-catégorie modifiée avec succès', 'success')
  } catch (error: any) {
    console.error('Error updating subcategory:', error)
    showSnackbar(error.response?.data?.error || 'Erreur lors de la modification de la sous-catégorie', 'error')
  } finally {
    loading.value = false
  }
}

const deleteSubCategory = async (id: string) => {
  deleteConfirmMessage.value = 'Êtes-vous sûr de vouloir supprimer cette sous-catégorie ? Les produits associés perdront leur sous-catégorie.'
  deleteConfirmCallback.value = async () => {
    try {
      loading.value = true
      await subCategoriesApi.delete(id)
      await loadCategories()
      showSnackbar('Sous-catégorie supprimée avec succès', 'success')
    } catch (error: any) {
      console.error('Error deleting subcategory:', error)
      showSnackbar(error.response?.data?.error || 'Erreur lors de la suppression de la sous-catégorie', 'error')
    } finally {
      loading.value = false
      showDeleteConfirmDialog.value = false
    }
  }
  showDeleteConfirmDialog.value = true
}

onMounted(() => {
  loadCategories()
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

