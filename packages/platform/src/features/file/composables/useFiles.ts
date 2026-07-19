import { ref } from 'vue'
import { fileApi } from '../api/fileApi'
import type { FileItem } from '../types/file.types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

export function useFiles() {
  const files = ref<FileItem[]>([])
  const isLoading = ref(false)
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  const fetchFiles = async (schoolUnitId?: string) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fileApi.getFiles(schoolUnitId)
      files.value = response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal memuat daftar berkas')
    } finally {
      isLoading.value = false
    }
  }

  const uploadFile = async (
    file: File,
    schoolUnitId?: string,
    categoryId?: string,
  ) => {
    isUploading.value = true
    error.value = null
    try {
      const response = await fileApi.uploadFile(file, schoolUnitId, categoryId)
      return response.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal mengunggah berkas')
      throw err
    } finally {
      isUploading.value = false
    }
  }

  const deleteFile = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await fileApi.deleteFile(id)
    } catch (err) {
      error.value = getIndonesianErrorMessage(err, 'Gagal menghapus berkas')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    files,
    isLoading,
    isUploading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
  }
}
