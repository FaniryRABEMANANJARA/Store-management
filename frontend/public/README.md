# Dossier Public

Ce dossier contient les **fichiers statiques** qui sont servis tels quels sans traitement par Vite.

## Utilisation

Les fichiers dans `public/` sont accessibles directement via l'URL racine `/`.

### Exemples :

- **Favicon** : `public/favicon.ico` → accessible via `/favicon.ico`
- **Logo** : `public/logo.png` → accessible via `/logo.png`
- **Images statiques** : `public/images/hero.jpg` → accessible via `/images/hero.jpg`

### Dans votre code :

```vue
<!-- Dans un template Vue -->
<img src="/logo.png" alt="Logo" />

<!-- Dans le HTML -->
<link rel="icon" href="/favicon.ico" />
```

## ⚠️ Important

- Les fichiers dans `public/` ne sont **pas** traités par Vite
- Utilisez des chemins absolus commençant par `/`
- Les fichiers sont copiés tels quels dans le build final

