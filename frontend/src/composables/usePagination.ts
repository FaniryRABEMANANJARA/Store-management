import { ref, computed } from 'vue'
import type { PaginationParams, PaginationResult } from '@/api/client'

export function usePagination<T>(
  defaultLimit: number = 10,
  defaultSortBy?: string,
  defaultSortOrder: 'asc' | 'desc' = 'desc'
) {
  const page = ref(1)
  const limit = ref(defaultLimit)
  const sortBy = ref(defaultSortBy)
  const sortOrder = ref<'asc' | 'desc'>(defaultSortOrder)
  const total = ref(0)
  const loading = ref(false)

  const paginationParams = computed<PaginationParams>(() => ({
    page: page.value,
    limit: limit.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }))

  const totalPages = computed(() => Math.ceil(total.value / limit.value))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  const updateFromResult = (result: PaginationResult<T>) => {
    total.value = result.pagination.total
    page.value = result.pagination.page
    limit.value = result.pagination.limit
  }

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
    }
  }

  const nextPage = () => {
    if (hasNext.value) {
      page.value++
    }
  }

  const prevPage = () => {
    if (hasPrev.value) {
      page.value--
    }
  }

  const firstPage = () => {
    page.value = 1
  }

  const lastPage = () => {
    page.value = totalPages.value
  }

  const setLimit = (newLimit: number) => {
    limit.value = Math.max(1, Math.min(100, newLimit))
    page.value = 1 // Reset to first page when changing limit
  }

  const setSorting = (newSortBy?: string, newSortOrder: 'asc' | 'desc' = 'desc') => {
    sortBy.value = newSortBy
    sortOrder.value = newSortOrder
    page.value = 1 // Reset to first page when changing sort
  }

  const reset = () => {
    page.value = 1
    limit.value = defaultLimit
    sortBy.value = defaultSortBy
    sortOrder.value = defaultSortOrder
    total.value = 0
  }

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    total,
    loading,
    paginationParams,
    totalPages,
    hasNext,
    hasPrev,
    updateFromResult,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setLimit,
    setSorting,
    reset,
  }
}
