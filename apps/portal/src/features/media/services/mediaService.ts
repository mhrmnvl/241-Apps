import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { mediaApi } from '../api/mediaApi'
import type { MediaLibraryItem, MediaUsage } from '../types'

export const mediaService = {
  async library(): Promise<MediaLibraryItem[]> {
    try {
      const { data } = await mediaApi.library()
      return data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat galeri media.'),
      )
      return []
    }
  },

  /**
   * Uploads and returns the item in library shape.
   *
   * The upload response carries a signed URL for immediate preview, but the
   * public address is derived from the id — never taken from that response.
   * Storing the signed URL in content is the failure this design prevents: it
   * works in testing and breaks days later when the signature expires.
   */
  async upload(file: File): Promise<MediaLibraryItem | null> {
    try {
      const { data } = await mediaApi.upload(file)
      const uploaded = data.data
      toast.success('Gambar diunggah.')
      return {
        id: uploaded.id,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
        previewUrl: uploaded.url,
        publicUrl: `/portal/public/media/${uploaded.id}`,
      }
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengunggah gambar.'))
      return null
    }
  },

  async usage(fileId: string): Promise<MediaUsage | null> {
    try {
      const { data } = await mediaApi.usage(fileId)
      return data.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat penggunaan berkas.'),
      )
      return null
    }
  },
}
