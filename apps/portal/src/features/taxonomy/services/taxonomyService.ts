import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { categoryApi, tagApi } from '../api/taxonomyApi'
import { useReferenceList } from '@/features/platform/reference-data'
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
  PostCategory,
  PostTag,
  PublicPostCategory,
  TagCreatePayload,
  TagUpdatePayload,
} from '../types'

interface DeleteCallbacks {
  closeAlert: () => void
  setLoading: (state: boolean) => void
}

/**
 * A 409 from a category delete carries the count and a sample of titles. The
 * generic error handler would render "Conflict", which tells the editor nothing
 * about which items are in the way (FR-037).
 */
function inUseMessage(error: unknown): string | null {
  const message = (
    error as { response?: { status?: number; data?: { message?: unknown } } }
  ).response
  if (message?.status !== 409) return null

  const body = message.data?.message
  if (body && typeof body === 'object' && 'count' in body) {
    const { count, sampleTitles } = body as {
      count: number
      sampleTitles?: string[]
    }
    const sample = sampleTitles?.length
      ? ` Contoh: ${sampleTitles.slice(0, 3).join(', ')}.`
      : ''
    return `Kategori masih dipakai oleh ${count} konten.${sample} Nonaktifkan kategori ini jika tidak ingin dipakai lagi.`
  }
  return null
}

export const categoryService = {
  /**
   * The category dropdown, held for the session.
   *
   * The catch stays outside the cached fetcher on purpose: it turns a failure
   * into an empty list for this caller, and caching *that* would serve "no
   * categories" for ten minutes after one bad request. Only a successful read
   * is held.
   */
  async list(): Promise<PostCategory[]> {
    try {
      return await useReferenceList().read('portalCategories', async () => {
        const { data } = await categoryApi.list()
        return data.data ?? []
      })
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat kategori.'))
      return []
    }
  },

  /** Anonymous. No toast — see postService.fetchPublicList for why. */
  async listPublic(): Promise<PublicPostCategory[]> {
    try {
      return await useReferenceList().read(
        'portalPublicCategories',
        async () => {
          const { data } = await categoryApi.listPublic()
          return data.data ?? []
        },
      )
    } catch {
      return []
    }
  },

  async create(payload: CategoryCreatePayload): Promise<boolean> {
    try {
      await categoryApi.create(payload)
      // Both the admin dropdown and the public list now show a stale set.
      useReferenceList().invalidate('portalCategories')
      useReferenceList().invalidate('portalPublicCategories')
      toast.success('Kategori ditambahkan.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menambah kategori.'))
      return false
    }
  },

  async update(id: string, payload: CategoryUpdatePayload): Promise<boolean> {
    try {
      await categoryApi.update(id, payload)
      // Both the admin dropdown and the public list now show a stale set.
      useReferenceList().invalidate('portalCategories')
      useReferenceList().invalidate('portalPublicCategories')
      toast.success('Kategori diperbarui.')
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memperbarui kategori.'),
      )
      return false
    }
  },

  async remove(id: string, callbacks?: DeleteCallbacks): Promise<boolean> {
    callbacks?.setLoading(true)
    try {
      await categoryApi.remove(id)
      // Both the admin dropdown and the public list now show a stale set.
      useReferenceList().invalidate('portalCategories')
      useReferenceList().invalidate('portalPublicCategories')
      toast.success('Kategori dihapus.')
      callbacks?.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(
        inUseMessage(error) ??
          getIndonesianErrorMessage(error, 'Gagal menghapus kategori.'),
      )
      return false
    } finally {
      callbacks?.setLoading(false)
    }
  },
}

export const tagService = {
  async list(search?: string): Promise<PostTag[]> {
    try {
      const { data } = await tagApi.list(search)
      return data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat tag.'))
      return []
    }
  },

  async listPublic(): Promise<PostTag[]> {
    try {
      const { data } = await tagApi.listPublic()
      return data.data ?? []
    } catch {
      return []
    }
  },

  async create(payload: TagCreatePayload): Promise<boolean> {
    try {
      await tagApi.create(payload)
      toast.success('Tag ditambahkan.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menambah tag.'))
      return false
    }
  },

  async update(id: string, payload: TagUpdatePayload): Promise<boolean> {
    try {
      await tagApi.update(id, payload)
      toast.success('Tag diperbarui.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memperbarui tag.'))
      return false
    }
  },

  async remove(id: string, callbacks?: DeleteCallbacks): Promise<boolean> {
    callbacks?.setLoading(true)
    try {
      await tagApi.remove(id)
      toast.success('Tag dihapus.')
      callbacks?.closeAlert()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus tag.'))
      return false
    } finally {
      callbacks?.setLoading(false)
    }
  },
}
