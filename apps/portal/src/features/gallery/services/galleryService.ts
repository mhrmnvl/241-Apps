import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { galleryApi, publicGalleryApi } from '../api/galleryApi'
import { useGalleryStore } from '../stores/galleryStore'
import type {
  AddPhotoPayload,
  CreateAlbumPayload,
  GalleryAlbum,
  UpdateAlbumPayload,
} from '../types'

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } }).response?.status
}

const CONFLICT_MESSAGE =
  'Album ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.'

export const galleryService = {
  async fetchList(search?: string) {
    const store = useGalleryStore()
    store.loading = true
    try {
      const { data } = await galleryApi.list({ search })
      store.albums = data.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat album.'))
    } finally {
      store.loading = false
    }
  },

  async fetchOne(id: string) {
    const store = useGalleryStore()
    store.loading = true
    store.reset()
    try {
      const { data } = await galleryApi.getById(id)
      store.current = data.data
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat album.'))
      return null
    } finally {
      store.loading = false
    }
  },

  async create(payload: CreateAlbumPayload): Promise<GalleryAlbum | null> {
    const store = useGalleryStore()
    store.isSaving = true
    try {
      const { data } = await galleryApi.create(payload)
      store.current = data.data
      toast.success('Draf album tersimpan.')
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan album.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async update(
    id: string,
    payload: UpdateAlbumPayload,
  ): Promise<GalleryAlbum | null> {
    const store = useGalleryStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = await galleryApi.update(id, payload)
      store.current = { ...data.data, photos: store.current?.photos }
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

  async addPhoto(albumId: string, payload: AddPhotoPayload): Promise<boolean> {
    const store = useGalleryStore()
    try {
      const { data } = await galleryApi.addPhoto(albumId, payload)
      if (store.current) {
        store.current.photos = [...(store.current.photos ?? []), data.data]
      }
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menambah foto.'))
      return false
    }
  },

  /**
   * Edits a photo's caption in place (FR-048).
   *
   * Optimistic, because the field is a text input the editor is looking at: a
   * round trip before the value settles reads as the input fighting back. The
   * previous value is restored on failure, so a rejected save cannot leave the
   * screen disagreeing with the database.
   */
  async updatePhotoCaption(
    albumId: string,
    photoId: string,
    caption: string,
  ): Promise<boolean> {
    const store = useGalleryStore()
    const photos = store.current?.photos ?? []
    const previous = photos.find((photo) => photo.id === photoId)?.caption
    const next = caption.trim() ? caption.trim() : null

    if (previous === next) return true

    if (store.current) {
      store.current.photos = photos.map((photo) =>
        photo.id === photoId ? { ...photo, caption: next } : photo,
      )
    }

    try {
      await galleryApi.updatePhoto(albumId, photoId, { caption: next })
      return true
    } catch (error: unknown) {
      if (store.current) {
        store.current.photos = (store.current.photos ?? []).map((photo) =>
          photo.id === photoId
            ? { ...photo, caption: previous ?? null }
            : photo,
        )
      }
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan keterangan.'),
      )
      return false
    }
  },

  async removePhoto(albumId: string, photoId: string): Promise<boolean> {
    const store = useGalleryStore()
    try {
      await galleryApi.removePhoto(albumId, photoId)
      if (store.current) {
        store.current.photos = (store.current.photos ?? []).filter(
          (photo) => photo.id !== photoId,
        )
      }
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus foto.'))
      return false
    }
  },

  /** Optimistic, then reconciled — see navigationService.reorder for why. */
  async reorderPhotos(albumId: string, photoIds: string[]): Promise<boolean> {
    const store = useGalleryStore()
    const previous = [...(store.current?.photos ?? [])]

    if (store.current) {
      store.current.photos = photoIds
        .map((id) => previous.find((photo) => photo.id === id))
        .filter((photo): photo is (typeof previous)[number] => Boolean(photo))
    }

    try {
      await galleryApi.reorderPhotos(albumId, photoIds)
      return true
    } catch (error: unknown) {
      if (store.current) store.current.photos = previous
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengurutkan foto.'))
      return false
    }
  },

  async setPublished(
    id: string,
    version: number,
    published: boolean,
  ): Promise<GalleryAlbum | null> {
    const store = useGalleryStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = published
        ? await galleryApi.publish(id, version)
        : await galleryApi.unpublish(id, version)
      store.current = { ...data.data, photos: store.current?.photos }
      store.albums = store.albums.map((album) =>
        album.id === id ? data.data : album,
      )
      toast.success(published ? 'Album diterbitkan.' : 'Album ditarik.')
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict = CONFLICT_MESSAGE
        return null
      }
      // The 422 for an empty album carries a message that names the problem.
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengubah status.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async remove(id: string): Promise<boolean> {
    const store = useGalleryStore()
    try {
      await galleryApi.remove(id)
      store.albums = store.albums.filter((album) => album.id !== id)
      toast.success('Album dihapus.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus album.'))
      return false
    }
  },

  /** Anonymous. No toast — an error popup on the public site helps nobody. */
  async fetchPublicList(page = 1) {
    const store = useGalleryStore()
    store.loading = true
    store.unavailable = false
    try {
      const { data } = await publicGalleryApi.list({ page })
      store.publicAlbums = data.data ?? []
      // Without the meta the view cannot know a second page exists, and the
      // pager silently never renders (FR-021).
      store.publicTotal = data.meta?.total ?? store.publicAlbums.length
      store.publicLimit = data.meta?.limit ?? store.publicLimit
    } catch {
      store.publicAlbums = []
      store.publicTotal = 0
      store.unavailable = true
    } finally {
      store.loading = false
    }
  },

  async fetchPublicAlbum(slug: string) {
    const store = useGalleryStore()
    store.loading = true
    store.resetPublic()
    try {
      const { data } = await publicGalleryApi.getBySlug(slug, { page: 1 })
      store.publicAlbum = data.data
    } catch (error: unknown) {
      if (statusOf(error) === 404) store.notFound = true
      else store.unavailable = true
    } finally {
      store.loading = false
    }
  },

  /**
   * Appends the next page of photos (FR-050, SC-015).
   *
   * The first page renders while the rest is still coming, which is what makes
   * a 50-photo album usable within seconds on a mobile connection rather than
   * a several-megabyte wait before anything appears.
   */
  async fetchMorePhotos(slug: string): Promise<void> {
    const store = useGalleryStore()
    const album = store.publicAlbum
    if (!album || store.loadingMorePhotos) return
    if (album.photos.meta.page >= album.photos.meta.totalPages) return

    store.loadingMorePhotos = true
    try {
      const { data } = await publicGalleryApi.getBySlug(slug, {
        page: album.photos.meta.page + 1,
      })
      store.publicAlbum = {
        ...data.data,
        photos: {
          data: [...album.photos.data, ...data.data.photos.data],
          meta: data.data.photos.meta,
        },
      }
    } catch {
      // Silent: the photos already on screen stay, and the visitor can retry by
      // scrolling again. A toast here would interrupt browsing over a hiccup.
    } finally {
      store.loadingMorePhotos = false
    }
  },
}
