<template>
  <v-app>
    <!-- Layout principal uniquement si l'utilisateur est authentifié -->
    <template v-if="isAuthenticated">
      <v-navigation-drawer
        v-model="drawer"
        :temporary="$vuetify.display.mobile"
        app
        color="primary"
        dark
      >
        <v-list nav density="compact">
          <v-list-item
            prepend-icon="mdi-view-dashboard"
            title="Dashboard"
            to="/"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-chart-line"
            title="Budget & CA"
            to="/budget"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-folder-multiple"
            title="Catégories"
            to="/categories"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-package-variant"
            title="Produits"
            to="/products"
          ></v-list-item>
         
          <v-list-item
            prepend-icon="mdi-cart-outline"
            title="Commandes"
            to="/orders"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cart-arrow-down"
            title="Achats"
            to="/purchases"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-cart-arrow-up"
            title="Ventes"
            to="/sales"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar app color="primary" dark>
        <v-app-bar-nav-icon
          @click="drawer = !drawer"
        ></v-app-bar-nav-icon>
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-package-variant</v-icon>
          Store Management
        </v-toolbar-title>
        <v-spacer></v-spacer>
        
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="32" color="white">
                <v-icon color="primary">mdi-account-circle</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title class="text-body-2 font-weight-bold">
                {{ user?.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ user?.email }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
              <v-list-item-title>Déconnexion</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-main style="background-color: #F5F7FA;">
        <v-container fluid>
          <router-view />
        </v-container>
      </v-main>

      <v-footer app color="primary" dark>
        <v-spacer></v-spacer>
        <div>
          © {{ new Date().getFullYear() }} Store Management System. Tous droits réservés.
        </div>
        <v-spacer></v-spacer>
      </v-footer>
    </template>

    <!-- Vue simple pour les pages d'authentification -->
    <template v-else>
      <v-main>
        <router-view />
      </v-main>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const drawer = ref(true)
const { isAuthenticated, user, logout, fetchUser } = useAuth()

onMounted(async () => {
  // Vérifier l'authentification au chargement
  if (localStorage.getItem('token')) {
    await fetchUser()
  }
})

async function handleLogout() {
  await logout()
}
</script>

<style>
/* Styles globaux si nécessaire */
</style>
