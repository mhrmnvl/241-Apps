import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { postApi } from '../api/postApi'
import { publicPostApi } from '../api/publicPostApi'
import { usePostStore } from '../stores/postStore'
import { usePublicPostStore } from '../stores/publicPostStore'
import type {
  CreatePostPayload,
  PostAdminDetail,
  PostType,
  PublicPostQuery,
  PublishPostPayload,
  UpdatePostPayload,
  VersionPayload,
} from '../types'
import { POST_TYPE_SLUGS } from '../types'

interface ConflictShaped {
  response?: { status?: number; data?: { message?: unknown } }
}

export type PostTransition = 'unpublish' | 'archive' | 'pin' | 'unpin'

/**
 * One row per transition: the call, and what to say when it lands or doesn't.
 *
 * `pin` and `unpin` are separate entries rather than one entry taking a
 * boolean. They read differently to the editor and they read differently in the
 * code, and it keeps every transition's payload down to the version — which is
 * the only thing the caller should have to know.
 */
const TRANSITIONS: Record<
  PostTransition,
  {
    call: (
      id: string,
      payload: VersionPayload,
    ) => ReturnType<typeof postApi.unpublish>
    done: string
    failed: string
  }
> = {
  unpublish: {
    call: (id, payload) => postApi.unpublish(id, payload),
    done: 'Konten ditarik dari publikasi.',
    failed: 'Gagal menarik konten dari publikasi.',
  },
  archive: {
    call: (id, payload) => postApi.archive(id, payload),
    done: 'Konten diarsipkan.',
    failed: 'Gagal mengarsipkan konten.',
  },
  pin: {
    call: (id, payload) => postApi.pin(id, { ...payload, pinned: true }),
    done: 'Konten disematkan di beranda.',
    failed: 'Gagal menyematkan konten.',
  },
  unpin: {
    call: (id, payload) => postApi.pin(id, { ...payload, pinned: false }),
    done: 'Sematan dilepas.',
    failed: 'Gagal melepas sematan.',
  },
}

/** Keeps the open list in step with a transition, without a refetch. */
function applyToList(
  store: ReturnType<typeof usePostStore>,
  updated: PostAdminDetail,
) {
  store.posts = store.posts.map((post) =>
    post.id === updated.id ? { ...post, ...updated } : post,
  )
}

function statusOf(error: unknown): number | undefined {
  return (error as ConflictShaped).response?.status
}

/** A 422 from the publish endpoint carries which fields still block it. */
function missingFieldsOf(error: unknown): string[] {
  const message = (error as ConflictShaped).response?.data?.message
  if (message && typeof message === 'object' && 'missingFields' in message) {
    const fields = (message as { missingFields?: unknown }).missingFields
    return Array.isArray(fields) ? (fields as string[]) : []
  }
  return []
}

export const postService = {
  async fetchList(type: PostType) {
    const store = usePostStore()
    store.loading = true
    try {
      const { data } = await postApi.list({
        type,
        page: store.page,
        limit: store.limit,
        search: store.search || undefined,
        includeDeleted: store.showDeleted,
      })
      store.posts = data.data ?? []
      store.total = data.meta?.total ?? store.posts.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat konten.'))
    } finally {
      store.loading = false
    }
  },

  async fetchOne(id: string) {
    const store = usePostStore()
    store.loading = true
    store.reset()
    try {
      const { data } = await postApi.getById(id)
      store.current = data.data
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat konten.'))
      return null
    } finally {
      store.loading = false
    }
  },

  async create(payload: CreatePostPayload): Promise<PostAdminDetail | null> {
    const store = usePostStore()
    store.isSaving = true
    try {
      const { data } = await postApi.create(payload)
      store.current = data.data
      toast.success('Draf tersimpan.')
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan draf.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async update(
    id: string,
    payload: UpdatePostPayload,
  ): Promise<PostAdminDetail | null> {
    const store = usePostStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = await postApi.update(id, payload)
      store.current = data.data
      toast.success('Perubahan tersimpan.')
      return data.data
    } catch (error: unknown) {
      // A concurrent save is not a generic failure — the editor needs to know
      // their copy is stale before they try again, or they lose the other
      // person's work on the retry (FR-013).
      if (statusOf(error) === 409) {
        store.conflict =
          'Konten ini sudah diubah oleh pengguna lain. Muat ulang halaman sebelum menyimpan agar perubahan mereka tidak hilang.'
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async publish(
    id: string,
    payload: PublishPostPayload,
  ): Promise<PostAdminDetail | null> {
    const store = usePostStore()
    store.isSaving = true
    store.conflict = null
    store.missingFields = []
    try {
      const { data } = await postApi.publish(id, payload)
      store.current = data.data
      toast.success(
        payload.scheduledAt
          ? 'Konten dijadwalkan terbit.'
          : 'Konten diterbitkan.',
      )
      return data.data
    } catch (error: unknown) {
      const status = statusOf(error)
      if (status === 409) {
        store.conflict =
          'Konten ini sudah diubah oleh pengguna lain. Muat ulang halaman sebelum menerbitkan.'
        return null
      }
      if (status === 422) {
        store.missingFields = missingFieldsOf(error)
        toast.error('Konten belum lengkap untuk diterbitkan.')
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal menerbitkan.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  /**
   * The lifecycle transitions, which share one shape: send the loaded version,
   * refresh the row on success, and treat a 409 as "your copy is stale" rather
   * than a generic failure (FR-013).
   *
   * Written as one helper because five near-identical copies is five places for
   * the conflict handling to drift, and the conflict handling is the part that
   * protects the other editor's work.
   */
  async transition(
    id: string,
    action: PostTransition,
    payload: VersionPayload,
  ): Promise<PostAdminDetail | null> {
    const store = usePostStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = await TRANSITIONS[action].call(id, payload)
      store.current = data.data
      applyToList(store, data.data)
      toast.success(TRANSITIONS[action].done)
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict =
          'Konten ini sudah diubah oleh pengguna lain. Muat ulang halaman sebelum mencoba lagi.'
        return null
      }
      toast.error(getIndonesianErrorMessage(error, TRANSITIONS[action].failed))
      return null
    } finally {
      store.isSaving = false
    }
  },

  /**
   * Soft delete. The row leaves the active list immediately rather than waiting
   * for a refetch, so the editor sees the effect of what they just clicked.
   */
  async remove(id: string): Promise<boolean> {
    const store = usePostStore()
    store.isSaving = true
    try {
      await postApi.remove(id)
      store.posts = store.posts.filter((post) => post.id !== id)
      store.total = Math.max(0, store.total - 1)
      toast.success('Konten dipindahkan ke tempat sampah.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus konten.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  async restore(id: string): Promise<boolean> {
    const store = usePostStore()
    store.isSaving = true
    try {
      await postApi.restore(id)
      store.posts = store.posts.filter((post) => post.id !== id)
      toast.success('Konten dipulihkan ke keadaan sebelumnya.')
      return true
    } catch (error: unknown) {
      // The 30-day window is the common case here, and the API's message names
      // it — a generic "failed" would leave the editor retrying forever.
      toast.error(getIndonesianErrorMessage(error, 'Gagal memulihkan konten.'))
      return false
    } finally {
      store.isSaving = false
    }
  },

  /**
   * Anonymous listing. No toast on failure for the same reason the homepage has
   * none: an error popup on the school's public website helps nobody, so the
   * store's flag drives an in-page notice instead.
   */
  async fetchPublicList(query: PublicPostQuery) {
    const store = usePublicPostStore()
    store.loading = true
    store.unavailable = false
    try {
      const { data } = await publicPostApi.list(query)
      store.items = data.data ?? []
      store.total = data.meta?.total ?? store.items.length
      store.page = data.meta?.page ?? query.page ?? 1
      store.limit = data.meta?.limit ?? store.limit
    } catch {
      store.items = []
      store.total = 0
      store.unavailable = true
    } finally {
      store.loading = false
    }
  },

  /**
   * Anonymous detail.
   *
   * A 404 is the whole public/draft boundary as this layer sees it: unknown
   * slug, draft, scheduled-but-not-yet-due, archived, and soft-deleted are one
   * indistinguishable case, and the service must not invent a distinction the
   * API deliberately refuses to make (FR-022, FR-026).
   */
  async fetchPublicDetail(type: PostType, slug: string) {
    const store = usePublicPostStore()
    store.loading = true
    store.resetDetail()
    const typeSlug = POST_TYPE_SLUGS[type]

    try {
      const { data } = await publicPostApi.getBySlug(typeSlug, slug)
      store.current = data.data
    } catch (error: unknown) {
      if (statusOf(error) === 404) {
        store.notFound = true
      } else {
        store.unavailable = true
      }
      return null
    } finally {
      store.loading = false
    }

    // Related items are decoration: a failure here leaves the article readable
    // rather than turning a working page into an error.
    try {
      const { data } = await publicPostApi.getRelated(typeSlug, slug)
      store.related = data.data ?? []
    } catch {
      store.related = []
    }

    return store.current
  },
}
