import { curriculumSubjectApi } from '../api/curriculumSubjectApi'
import { useCurriculumSubjectStore } from '../stores/curriculumSubjectStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { subjectApi } from '@/features/academic/subject'
import { curriculumApi } from '@/features/academic/curriculum'
import type {
  CurriculumSubjectSavePayload,
  CurriculumSubjectQueryParams,
} from '../types'

export const curriculumSubjectService = {
  fetchReferenceData: async () => {
    const store = useCurriculumSubjectStore()
    try {
      const res = await subjectApi.getSubjects({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      store.subjects = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data referensi.'),
      )
    }
  },

  fetchCurriculumSubjects: async (curriculumId: string) => {
    const store = useCurriculumSubjectStore()
    store.loading = true
    try {
      const params: CurriculumSubjectQueryParams = {
        curriculumId,
        limit: PAGINATION.CHILD_ENTITY_LIMIT,
      }

      const res = await curriculumSubjectApi.getCurriculumSubjects(params)
      store.items = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memuat data mata pelajaran kurikulum.',
        ),
      )
    } finally {
      store.loading = false
    }
  },

  fetchCurriculumInfo: async (curriculumId: string) => {
    const store = useCurriculumSubjectStore()
    try {
      const res = await curriculumApi.getCurriculumById(curriculumId)
      const curriculum = res.data?.data
      if (curriculum) {
        store.curriculumName = curriculum.name
        store.curriculumAcademicYear = curriculum.academicYear?.name ?? ''
      }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data kurikulum.'),
      )
    }
  },

  saveCurriculumSubject: async (
    id: string | null,
    payload: CurriculumSubjectSavePayload,
  ) => {
    const store = useCurriculumSubjectStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await curriculumSubjectApi.updateCurriculumSubject(id, payload)
        toast.success('Berhasil memperbarui mata pelajaran kurikulum')
      } else {
        await curriculumSubjectApi.createCurriculumSubject(payload)
        toast.success('Berhasil menambah mata pelajaran kurikulum')
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan mata pelajaran kurikulum.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  bulkCreateCurriculumSubjects: async (
    curriculumId: string,
    subjectIds: string[],
  ) => {
    const store = useCurriculumSubjectStore()
    store.isSaving = true
    store.formError = null
    try {
      const items = subjectIds.map((subjectId) => ({ curriculumId, subjectId }))
      const res = await curriculumSubjectApi.bulkCreateCurriculumSubjects(items)
      const created = res.data?.data?.created ?? 0
      const skipped = res.data?.data?.skipped ?? 0
      if (skipped > 0) {
        toast.success(
          `${created} mata pelajaran berhasil ditambahkan, ${skipped} sudah ada sebelumnya`,
        )
      } else {
        toast.success(`${created} mata pelajaran berhasil ditambahkan`)
      }
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menambahkan mata pelajaran kurikulum.',
      )
      toast.error(store.formError ?? '')
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteCurriculumSubject: async (id: string) => {
    try {
      await curriculumSubjectApi.deleteCurriculumSubject(id)
      toast.success('Mata pelajaran kurikulum berhasil dihapus')
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        error,
        'Gagal menghapus mata pelajaran kurikulum.',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
}
