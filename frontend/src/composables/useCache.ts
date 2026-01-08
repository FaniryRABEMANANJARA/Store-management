/**
 * Système de cache côté client
 * Utilise localStorage pour persister les données fréquemment utilisées
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en millisecondes
}

class ClientCache {
  private defaultTTL = 5 * 60 * 1000 // 5 minutes par défaut
  private memoryCache = new Map<string, CacheEntry<any>>()

  /**
   * Récupère une valeur du cache (mémoire puis localStorage)
   */
  get<T>(key: string): T | null {
    // Vérifier d'abord le cache mémoire
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry) {
      const now = Date.now()
      if (now - memoryEntry.timestamp < memoryEntry.ttl) {
        return memoryEntry.data as T
      }
      this.memoryCache.delete(key)
    }

    // Vérifier localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (!stored) return null

      const entry: CacheEntry<T> = JSON.parse(stored)
      const now = Date.now()

      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }

      // Mettre en cache mémoire aussi
      this.memoryCache.set(key, entry)
      return entry.data
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }

  /**
   * Stocke une valeur dans le cache (mémoire et localStorage)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }

    // Mettre en cache mémoire
    this.memoryCache.set(key, entry)

    // Mettre en cache localStorage
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
    } catch (error) {
      // Si localStorage est plein, nettoyer les anciennes entrées
      console.warn('localStorage full, cleaning old entries')
      this.cleanup()
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      } catch (e) {
        console.error('Failed to cache in localStorage:', e)
      }
    }
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.error('Error deleting from cache:', error)
    }
  }

  /**
   * Supprime toutes les clés correspondant à un préfixe
   */
  deleteByPrefix(prefix: string): void {
    // Nettoyer le cache mémoire
    const keysToDelete: string[] = []
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.memoryCache.delete(key))

    // Nettoyer localStorage
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`cache_${prefix}`)) {
          keys.push(key)
        }
      }
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error deleting by prefix from cache:', error)
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.memoryCache.clear()
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cache_')) {
          keys.push(key)
        }
      }
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now()
    
    // Nettoyer le cache mémoire
    const memoryKeysToDelete: string[] = []
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        memoryKeysToDelete.push(key)
      }
    }
    memoryKeysToDelete.forEach(key => this.memoryCache.delete(key))

    // Nettoyer localStorage
    try {
      const keysToDelete: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('cache_')) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry: CacheEntry<any> = JSON.parse(stored)
              if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key)
              }
            }
          } catch (e) {
            // Si l'entrée est corrompue, la supprimer
            keysToDelete.push(key)
          }
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error cleaning cache:', error)
    }
  }

  /**
   * Génère une clé de cache à partir de paramètres
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  }
}

export const clientCache = new ClientCache()

// Nettoyer le cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup()
  }, 10 * 60 * 1000)
}
