import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  GalleryAlbum,
  PublicAlbumDetail,
  PublicAlbumSummary,
} from '../types'

export const useGalleryStore = defineStore('portal-gallery', () => {
  const albums = ref<GalleryAlbum[]>([])
  const current = ref<GalleryAlbum | null>(null)

  const publicAlbums = ref<PublicAlbumSummary[]>([])
  const publicAlbum = ref<PublicAlbumDetail | null>(null)

  const loading = ref(false)
  const isSaving = ref(false)
  /** Distinct from `loading`: the album is already on screen while more of its
   *  photos are still arriving, and the two states look different. */
  const loadingMorePhotos = ref(false)
  const conflict = ref<string | null>(null)
  const notFound = ref(false)
  const unavailable = ref(false)

  function reset() {
    current.value = null
    conflict.value = null
  }

  function resetPublic() {
    publicAlbum.value = null
    notFound.value = false
    unavailable.value = false
  }

  return {
    albums,
    current,
    publicAlbums,
    publicAlbum,
    loading,
    isSaving,
    loadingMorePhotos,
    conflict,
    notFound,
    unavailable,
    reset,
    resetPublic,
  }
})
