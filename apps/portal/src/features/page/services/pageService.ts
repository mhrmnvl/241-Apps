import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { navigationApi, pageApi } from '../api/pageApi'
import { usePageStore } from '../stores/pageStore'
import type {
  CreateNavItemPayload,
  CreatePagePayload,
  PortalPage,
  UpdateNavItemPayload,
  UpdatePagePayload,
} from '../types'

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } }).response?.status
}

const CONFLICT_MESSAGE =
  'Halaman ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.'

export const pageService = {
  async fetchList() {
    const store = usePageStore()
    store.loading = true
    try {
      const { data } = await pageApi.list()
      store.pages = data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat halaman.'))
    } finally {
      store.loading = false
    }
  },

  async fetchOne(id: string) {
    const store = usePageStore()
    store.loading = true
    store.reset()
    try {
      const { data } = await pageApi.getById(id)
      store.current = data.data
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat halaman.'))
      return null
    } finally {
      store.loading = false
    }
  },

  async create(payload: CreatePagePayload): Promise<PortalPage | null> {
    const store = usePageStore()
    store.isSaving = true
    try {
      const { data } = await pageApi.create(payload)
      store.current = data.data
      toast.success('Draf halaman tersimpan.')
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan halaman.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async update(
    id: string,
    payload: UpdatePagePayload,
  ): Promise<PortalPage | null> {
    const store = usePageStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = await pageApi.update(id, payload)
      store.current = data.data
      toast.success('Perubahan tersimpan.')
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict = CONFLICT_MESSAGE
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async setPublished(
    id: string,
    version: number,
    published: boolean,
  ): Promise<PortalPage | null> {
    const store = usePageStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = published
        ? await pageApi.publish(id, version)
        : await pageApi.unpublish(id, version)
      store.current = data.data
      store.pages = store.pages.map((page) =>
        page.id === id ? data.data : page,
      )
      toast.success(
        published
          ? 'Halaman diterbitkan.'
          : 'Halaman ditarik dari publikasi. Menu yang menautnya ikut disembunyikan.',
      )
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict = CONFLICT_MESSAGE
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengubah status.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async remove(id: string): Promise<boolean> {
    const store = usePageStore()
    try {
      await pageApi.remove(id)
      store.pages = store.pages.filter((page) => page.id !== id)
      toast.success('Halaman dihapus.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus halaman.'))
      return false
    }
  },

  /** Anonymous. No toast — an error popup on the public site helps nobody. */
  async fetchPublic(slug: string) {
    const store = usePageStore()
    store.loading = true
    store.resetPublic()
    try {
      const { data } = await pageApi.getPublic(slug)
      store.publicPage = data.data
    } catch (error: unknown) {
      // A draft, a deleted page, and an address that never existed are one
      // indistinguishable case here, exactly as the API intends.
      if (statusOf(error) === 404) store.notFound = true
      else store.unavailable = true
    } finally {
      store.loading = false
    }
  },
}

export const navigationService = {
  async fetchList() {
    const store = usePageStore()
    store.loading = true
    try {
      const { data } = await navigationApi.list()
      store.navItems = [...(data.data ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      )
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat menu.'))
    } finally {
      store.loading = false
    }
  },

  /**
   * The public menu. Failure leaves `publicNav` empty rather than blocking the
   * page: a visitor reading an article with no menu is inconvenienced, one
   * looking at an error page is turned away.
   */
  async fetchPublic() {
    const store = usePageStore()
    try {
      const { data } = await navigationApi.listPublic()
      store.publicNav = data.data ?? []
    } catch {
      store.publicNav = []
    }
  },

  async create(payload: CreateNavItemPayload): Promise<boolean> {
    try {
      await navigationApi.create(payload)
      toast.success('Menu ditambahkan.')
      await navigationService.fetchList()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menambah menu.'))
      return false
    }
  },

  async update(id: string, payload: UpdateNavItemPayload): Promise<boolean> {
    try {
      await navigationApi.update(id, payload)
      toast.success('Menu diperbarui.')
      await navigationService.fetchList()
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memperbarui menu.'))
      return false
    }
  },

  /**
   * Reorders optimistically, then reconciles.
   *
   * Drag-and-drop that waits for a round trip before the item settles feels
   * broken; the list is restored from the server on failure, so a rejected
   * reorder cannot leave the screen disagreeing with the database.
   */
  async reorder(itemIds: string[]): Promise<boolean> {
    const store = usePageStore()
    const previous = [...store.navItems]

    store.navItems = itemIds
      .map((id) => previous.find((item) => item.id === id))
      .filter((item): item is (typeof previous)[number] => item !== undefined)

    try {
      await navigationApi.reorder(itemIds)
      return true
    } catch (error: unknown) {
      store.navItems = previous
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengurutkan menu.'))
      return false
    }
  },

  async remove(id: string): Promise<boolean> {
    const store = usePageStore()
    try {
      await navigationApi.remove(id)
      store.navItems = store.navItems.filter((item) => item.id !== id)
      toast.success('Menu dihapus.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus menu.'))
      return false
    }
  },
}
