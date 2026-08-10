import { studentParentApi } from '../api/studentParentApi'
import { useStudentParentStore } from '../stores/studentParentStore'
import { PAGINATION } from '@/shared/constants/pagination'
import type {
  StudentParentQueryParams,
  StudentParentSavePayload,
  StudentParentUpdatePayload,
} from '../types'
import { studentApi } from '@/features/academic/student'
import { parentApi } from '@/features/academic/parent'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const studentParentService = {
  fetchAll: async (params?: StudentParentQueryParams) => {
    const store = useStudentParentStore()
    store.loading = true
    try {
      const mergedParams: StudentParentQueryParams = {
        page: store.currentPage,
        limit: store.pageSize,
        ...params,
      }
      const res = await studentParentApi.getAll(mergedParams)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data orang tua.'),
      )
      store.items = []
      store.totalItems = 0
    } finally {
      store.loading = false
    }
  },

  save: async (
    id: string | null,
    payload: StudentParentSavePayload | StudentParentUpdatePayload,
  ) => {
    const store = useStudentParentStore()
    store.isSaving = true
    store.formError = null

    try {
      if (id) {
        await studentParentApi.update(id, payload)
      } else {
        await studentParentApi.create(payload as StudentParentSavePayload)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan relasi orang tua',
      )
      toast.error(store.formError)
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteStudentParent: async (id: string) => {
    const store = useStudentParentStore()
    store.loading = true
    try {
      await studentParentApi.delete(id)
      return { success: true }
    } catch (error: unknown) {
      const errorMsg = getIndonesianErrorMessage(
        error,
        'Gagal menghapus relasi orang tua',
      )
      toast.error(errorMsg)
      return {
        success: false,
        error: errorMsg,
      }
    } finally {
      store.loading = false
    }
  },

  fetchStudents: async () => {
    const store = useStudentParentStore()
    try {
      const res = await studentApi.getStudents({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      const data = res.data?.data ?? []
      store.students = data.map((item) => ({
        id: item.id,
        name: item.user?.profile?.name ?? '-',
        nisn: item.nisn ?? '-',
      }))
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat daftar siswa.'),
      )
    }
  },

  fetchParents: async () => {
    const store = useStudentParentStore()
    try {
      const res = await parentApi.getParents({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      const data = res.data?.data ?? []
      store.parents = data.map((item) => ({
        id: item.id,
        name: item.name ?? '-',
        nik: item.nik ?? '-',
      }))
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat daftar orang tua.'),
      )
    }
  },
}
