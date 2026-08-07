import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PostDetail, PostSummary } from '../types'

/**
 * The reading surface. Kept separate from `usePostStore` on purpose: the
 * management store carries drafts, versions, and conflict state that an
 * anonymous visitor must never hold, and sharing one store would make it easy
 * for a public view to render a field the API never sent it.
 */
export const usePublicPostStore = defineStore('portal-public-post', () => {
  const items = ref<PostSummary[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(9)

  const current = ref<PostDetail | null>(null)
  const related = ref<PostSummary[]>([])

  const loading = ref(false)

  /**
   * A 404 from the API. Unknown slug, draft, scheduled, archived, and deleted
   * all land here identically — the frontend cannot tell them apart and must
   * not try to (FR-022, FR-026).
   */
  const notFound = ref(false)

  /** A transport or server failure, which is a different thing from a 404 and
   *  gets a "try again" message rather than the not-found page. */
  const unavailable = ref(false)

  function resetDetail() {
    current.value = null
    related.value = []
    notFound.value = false
    unavailable.value = false
  }

  return {
    items,
    total,
    page,
    limit,
    current,
    related,
    loading,
    notFound,
    unavailable,
    resetDetail,
  }
})
