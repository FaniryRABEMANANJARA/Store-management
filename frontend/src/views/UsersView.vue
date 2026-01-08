<template>
  <div>
    <v-row>
      <v-col cols="12" class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3">
        <h1 class="text-body-1 text-sm-h4">
          <v-icon class="mr-2" color="primary" size="small">mdi-account-group</v-icon>
          Gestion des Utilisateurs
        </h1>
        <v-btn 
          color="primary" 
          @click="showCreateDialog = true" 
          class="d-sm-inline-block w-100 w-sm-auto" 
          :size="$vuetify.display.xs ? 'small' : 'default'" 
          :block="$vuetify.display.xs"
        >
          <v-icon class="mr-2" size="small">mdi-account-plus</v-icon>
          Ajouter un utilisateur
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6">Liste des Utilisateurs</v-card-title>
          <v-card-text class="pa-4 pa-md-6">
            <v-data-table
              :headers="headers"
              :items="users"
              :loading="loading"
              item-key="id"
              class="elevation-0"
            >
              <template v-slot:item.role="{ item }">
                <v-chip
                  :color="item.role === 'admin' ? 'error' : 'primary'"
                  dark
                  size="small"
                >
                  {{ item.role === 'admin' ? 'Administrateur' : 'Utilisateur' }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template v-slot:item.actions="{ item }">
                <div class="d-flex gap-2">
                  <v-tooltip text="Modifier">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-pencil"
                        color="warning"
                        variant="text"
                        size="small"
                        @click="editUser(item)"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                        :disabled="item.id === currentUserId"
                        @click="deleteUser(item)"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de création -->
    <v-dialog v-model="showCreateDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="primary">mdi-account-plus</v-icon>
          Créer un nouvel utilisateur
        </v-card-title>
        <v-card-text>
          <v-form ref="createForm" v-model="createFormValid">
            <v-text-field
              v-model="newUser.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              required
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="newUser.name"
              label="Nom complet"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              required
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="newUser.password"
              label="Mot de passe"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="[rules.required, rules.minLength]"
              required
              class="mb-3"
            ></v-text-field>
            <v-select
              v-model="newUser.role"
              label="Rôle"
              prepend-inner-icon="mdi-account-key"
              :items="roleOptions"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelCreate">Annuler</v-btn>
          <v-btn color="primary" :loading="loading" @click="createUser">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog d'édition -->
    <v-dialog v-model="showEditDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h6">
          <v-icon class="mr-2" color="warning">mdi-pencil</v-icon>
          Modifier l'utilisateur
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editingUser.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              :rules="[rules.required, rules.email]"
              required
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="editingUser.name"
              label="Nom complet"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              required
              class="mb-3"
            ></v-text-field>
            <v-text-field
              v-model="editingUser.password"
              label="Nouveau mot de passe (laisser vide pour ne pas changer)"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="[rules.minLengthOptional]"
              hint="Laissez vide si vous ne souhaitez pas changer le mot de passe"
              persistent-hint
              class="mb-3"
            ></v-text-field>
            <v-select
              v-model="editingUser.role"
              label="Rôle"
              prepend-inner-icon="mdi-account-key"
              :items="roleOptions"
              item-title="text"
              item-value="value"
              :rules="[rules.required]"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelEdit">Annuler</v-btn>
          <v-btn color="primary" :loading="loading" @click="updateUser">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      :icon="snackbar.icon"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fermer</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usersApi, type User } from '@/api/client'
import { useAuth } from '@/composables/useAuth'

const { user: currentUser } = useAuth()
const currentUserId = computed(() => currentUser.value?.id || '')

const users = ref<User[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const createFormValid = ref(false)
const editFormValid = ref(false)
const createForm = ref<any>(null)
const editForm = ref<any>(null)

const newUser = ref({
  email: '',
  name: '',
  password: '',
  role: 'user',
})

const editingUser = ref<User | null>(null)

const roleOptions = [
  { text: 'Utilisateur', value: 'user' },
  { text: 'Administrateur', value: 'admin' },
]

const headers = [
  { title: 'Email', key: 'email' },
  { title: 'Nom', key: 'name' },
  { title: 'Rôle', key: 'role' },
  { title: 'Date de création', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' },
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  timeout: 4000,
  icon: 'mdi-check-circle',
})

const rules = {
  required: (v: any) => !!v || 'Ce champ est requis',
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(v) || 'Email invalide'
  },
  minLength: (v: string) => v.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères',
  minLengthOptional: (v: string) => !v || v.length >= 6 || 'Le mot de passe doit contenir au moins 6 caractères',
}

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

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await usersApi.getAll()
    users.value = response.data
  } catch (error: any) {
    console.error('Error loading users:', error)
    showSnackbar(
      error.response?.data?.error || 'Erreur lors du chargement des utilisateurs',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  const { valid } = await createForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    await usersApi.create(newUser.value)
    cancelCreate()
    await loadUsers()
    showSnackbar('Utilisateur créé avec succès', 'success')
  } catch (error: any) {
    console.error('Error creating user:', error)
    showSnackbar(
      error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const cancelCreate = () => {
  showCreateDialog.value = false
  newUser.value = {
    email: '',
    name: '',
    password: '',
    role: 'user',
  }
  createForm.value?.resetValidation()
}

const editUser = (user: User) => {
  editingUser.value = {
    ...user,
    password: '', // Ne pas pré-remplir le mot de passe
  }
  showEditDialog.value = true
}

const updateUser = async () => {
  if (!editingUser.value) return

  const { valid } = await editForm.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    const updateData: any = {
      email: editingUser.value.email,
      name: editingUser.value.name,
      role: editingUser.value.role,
    }
    
    // Inclure le mot de passe seulement s'il est fourni
    if (editingUser.value.password && editingUser.value.password.trim() !== '') {
      updateData.password = editingUser.value.password
    }

    await usersApi.update(editingUser.value.id, updateData)
    cancelEdit()
    await loadUsers()
    showSnackbar('Utilisateur modifié avec succès', 'success')
  } catch (error: any) {
    console.error('Error updating user:', error)
    showSnackbar(
      error.response?.data?.error || 'Erreur lors de la modification de l\'utilisateur',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  showEditDialog.value = false
  editingUser.value = null
  editForm.value?.resetValidation()
}

const deleteUser = async (user: User) => {
  if (user.id === currentUserId.value) {
    showSnackbar('Vous ne pouvez pas supprimer votre propre compte', 'error')
    return
  }

  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" (${user.email}) ?`)) {
    return
  }

  try {
    loading.value = true
    await usersApi.delete(user.id)
    await loadUsers()
    showSnackbar('Utilisateur supprimé avec succès', 'success')
  } catch (error: any) {
    console.error('Error deleting user:', error)
    showSnackbar(
      error.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur',
      'error'
    )
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadUsers()
})
</script>
