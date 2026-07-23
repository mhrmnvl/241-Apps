import type { ApiSingleResponse } from '@/shared/types/api'
import type { FileItem } from '../types/file.types'
import api from '@/shared/utils/api'
import { authConfig } from '../../auth/config'

export const fileApi = {
  getFiles: (schoolUnitId?: string) => {
    const params = schoolUnitId ? { schoolUnitId } : {}
    return api.get<ApiSingleResponse<FileItem[]>>('/files', { params })
  },

  uploadFile: (file: File, schoolUnitId?: string, categoryId?: string) => {
    const formData = new FormData()
    formData.append('file', file)

    // appKey tags which app the upload came from, purely for how the
    // backend organizes its storage bucket (see StorageKeyBuilder) — not a
    // data-scoping concern, so it's read from the same app-identity config
    // already set up per app in main.ts rather than passed in by callers.
    const params: {
      appKey: string
      schoolUnitId?: string
      categoryId?: string
    } = { appKey: authConfig.value.appKey }
    if (schoolUnitId) params.schoolUnitId = schoolUnitId
    if (categoryId) params.categoryId = categoryId

    return api.post<ApiSingleResponse<FileItem>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params,
    })
  },

  deleteFile: (id: string) => {
    return api.delete<void>(`/files/${id}`)
  },
}
