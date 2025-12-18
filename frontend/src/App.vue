<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1 class="logo">📦 Store Management</h1>
        <ul class="nav-links">
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/products">Produits</router-link></li>
          <li><router-link to="/purchases">Achats</router-link></li>
          <li><router-link to="/sales">Ventes</router-link></li>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// App component
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  opacity: 0.8;
  text-decoration: underline;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
</style>

