<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12" rounded="lg">
          <v-card-title class="text-center pa-6">
            <v-icon size="48" color="primary" class="mb-2">mdi-store</v-icon>
            <div class="text-h4 font-weight-bold">Store Management</div>
            <div class="text-subtitle-1 text-grey mt-2">Connectez-vous à votre compte</div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Mot de passe"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                required
              ></v-text-field>

              <v-checkbox
                v-model="rememberMe"
                label="Se souvenir de moi"
                color="primary"
                density="compact"
                class="mb-3"
                hide-details
              ></v-checkbox>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                class="mb-3"
              >
                <v-icon left>mdi-login</v-icon>
                Se connecter
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <span class="text-body-2 text-grey">Pas encore de compte ?</span>
            <v-btn
              variant="text"
              color="primary"
              to="/register"
              class="ml-2"
            >
              S'inscrire
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const formRef = ref()
const valid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const emailRules = [
  (v: string) => !!v || 'L\'email est requis',
  (v: string) => /.+@.+\..+/.test(v) || 'L\'email doit être valide',
]

const passwordRules = [
  (v: string) => !!v || 'Le mot de passe est requis',
  (v: string) => (v && v.length >= 6) || 'Le mot de passe doit contenir au moins 6 caractères',
]

async function handleLogin() {
  const { valid: formValid } = await formRef.value.validate()
  if (!formValid) return

  loading.value = true
  error.value = ''

  const result = await login(email.value, password.value, rememberMe.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erreur lors de la connexion'
  }

  loading.value = false
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background-image: url('@/assets/images/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.fill-height::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(74, 144, 226, 0.7);
  z-index: 0;
}

.fill-height > * {
  position: relative;
  z-index: 1;
}

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

