import { ref, computed, watch, onMounted } from 'vue'

export interface FilterConfig {
  search?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  status?: string
  [key: string]: any
}

export interface FilterOptions {
  storageKey?: string // Clé pour sauvegarder les préférences
  debounceMs?: number // Délai pour le debounce de la recherche
}

export function useTableFilters<T extends Record<string, any>>(
  items: { value: T[] },
  options: FilterOptions = {}
) {
  const { storageKey, debounceMs = 300 } = options

  // État des filtres
  const filters = ref<FilterConfig>({
    search: '',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    priceMin: undefined,
    priceMax: undefined,
    status: '',
  })

  // Charger les préférences sauvegardées
  const loadSavedFilters = () => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(`filters_${storageKey}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          filters.value = { ...filters.value, ...parsed }
        }
      } catch (error) {
        console.error('Error loading saved filters:', error)
      }
    }
  }

  // Sauvegarder les préférences
  const saveFilters = () => {
    if (storageKey) {
      try {
        localStorage.setItem(`filters_${storageKey}`, JSON.stringify(filters.value))
      } catch (error) {
        console.error('Error saving filters:', error)
      }
    }
  }

  // Réinitialiser les filtres
  const resetFilters = () => {
    filters.value = {
      search: '',
      categoryId: '',
      dateFrom: '',
      dateTo: '',
      priceMin: undefined,
      priceMax: undefined,
      status: '',
    }
    saveFilters()
  }

  // Fonction de recherche générique
  const searchInItem = (item: T, searchTerm: string): boolean => {
    if (!searchTerm) return true
    
    const term = searchTerm.toLowerCase()
    
    // Rechercher dans toutes les propriétés string de l'objet
    for (const key in item) {
      const value = item[key]
      
      if (typeof value === 'string' && value.toLowerCase().includes(term)) {
        return true
      }
      
      // Rechercher dans les objets imbriqués (ex: product.name)
      if (typeof value === 'object' && value !== null) {
        if (searchInItem(value as T, searchTerm)) {
          return true
        }
      }
    }
    
    return false
  }

  // Filtrer par date
  const filterByDate = (item: T, dateField: string): boolean => {
    if (!filters.value.dateFrom && !filters.value.dateTo) return true
    
    const itemDate = new Date((item as any)[dateField])
    if (isNaN(itemDate.getTime())) return true
    
    if (filters.value.dateFrom) {
      const fromDate = new Date(filters.value.dateFrom)
      fromDate.setHours(0, 0, 0, 0)
      if (itemDate < fromDate) return false
    }
    
    if (filters.value.dateTo) {
      const toDate = new Date(filters.value.dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (itemDate > toDate) return false
    }
    
    return true
  }

  // Filtrer par plage de prix
  const filterByPrice = (item: T, priceField: string): boolean => {
    const price = (item as any)[priceField]
    if (typeof price !== 'number') return true
    
    if (filters.value.priceMin !== undefined && price < filters.value.priceMin) {
      return false
    }
    
    if (filters.value.priceMax !== undefined && price > filters.value.priceMax) {
      return false
    }
    
    return true
  }

  // Filtrer par catégorie
  const filterByCategory = (item: T, categoryField: string = 'categoryId'): boolean => {
    if (!filters.value.categoryId) return true
    const itemCategoryId = (item as any)[categoryField] || (item as any).category?.id
    return itemCategoryId === filters.value.categoryId
  }

  // Filtrer par statut
  const filterByStatus = (item: T, statusField: string = 'status'): boolean => {
    if (!filters.value.status) return true
    return (item as any)[statusField] === filters.value.status
  }

  // Items filtrés
  const filteredItems = computed(() => {
    return items.value.filter((item) => {
      // Recherche globale
      if (filters.value.search && !searchInItem(item, filters.value.search)) {
        return false
      }
      
      // Filtre par catégorie
      if (!filterByCategory(item)) {
        return false
      }
      
      // Filtre par statut
      if (!filterByStatus(item)) {
        return false
      }
      
      return true
    })
  })

  // Watcher pour sauvegarder automatiquement
  watch(
    filters,
    () => {
      saveFilters()
    },
    { deep: true }
  )

  // Charger les filtres sauvegardés au montage
  onMounted(() => {
    loadSavedFilters()
  })

  return {
    filters,
    filteredItems,
    resetFilters,
    filterByDate,
    filterByPrice,
    filterByCategory,
    filterByStatus,
  }
}
