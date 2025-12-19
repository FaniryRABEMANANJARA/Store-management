# Dossier Assets

Ce dossier contient les **fichiers qui seront traités par Vite** (optimisation, hashage, etc.).

## Structure recommandée

```
assets/
├── images/          # Images (logos, photos, illustrations)
├── icons/           # Icônes SVG
├── fonts/           # Polices personnalisées
└── styles/          # Fichiers CSS/SCSS supplémentaires
```

## Utilisation

### Images

```vue
<script setup>
// Import dans le script
import logo from '@/assets/images/logo.png'
import heroImage from '@/assets/images/hero.jpg'
</script>

<template>
  <img :src="logo" alt="Logo" />
  <img :src="heroImage" alt="Hero" />
</template>
```

### Icônes SVG

```vue
<script setup>
import iconStore from '@/assets/icons/store.svg'
</script>

<template>
  <img :src="iconStore" alt="Store Icon" />
</template>
```

### Polices

```css
/* Dans un fichier CSS */
@font-face {
  font-family: 'CustomFont';
  src: url('@/assets/fonts/custom-font.woff2') format('woff2');
}
```

## Avantages

- ✅ **Optimisation automatique** : Vite optimise les images
- ✅ **Hashage des noms** : Cache busting automatique
- ✅ **Tree-shaking** : Seuls les assets utilisés sont inclus
- ✅ **Support TypeScript** : Types pour les imports d'assets

## 📝 Note

Pour les **petites images** (< 4KB), considérez les convertir en **base64** ou utiliser des **SVG inline**.

