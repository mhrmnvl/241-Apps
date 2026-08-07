import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PostAdminDetail, PostAdminSummary, PostType } from '../types'

export const usePostStore = defineStore('portal-post', () => {
  const posts = ref<PostAdminSummary[]>([])
  const current = ref<PostAdminDetail | null>(null)

  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)

  const activeType = ref<PostType>('BERITA')
  const search = ref('')
  const showDeleted = ref(false)

  const loading = ref(false)
  const isSaving = ref(false)

  /**
   * Set when a save is refused because someone else saved first. The form
   * shows it as a blocking notice rather than a toast, because a toast is
   * dismissible and losing the warning means losing the edit.
   */
  const conflict = ref<string | null>(null)

  /** Per-field messages from a 422 — which fields still block publishing. */
  const missingFields = ref<string[]>([])

  function reset() {
    current.value = null
    conflict.value = null
    missingFields.value = []
  }

  return {
    posts,
    current,
    total,
    page,
    limit,
    activeType,
    search,
    showDeleted,
    loading,
    isSaving,
    conflict,
    missingFields,
    reset,
  }
})
