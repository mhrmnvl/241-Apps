import { raporApi } from '../api/raporApi'
import { useRaporStore } from '../stores/raporStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type {
  BulkGenerateResult,
  GenerateRaporPayload,
  RaporQueryParams,
  RaporScoreRow,
  UpdateRaporPayload,
} from '../types'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { studentScoreApi } from '@/features/academic/student-score'
import type { StudentScoreItem } from '@/features/academic/student-score/types'

export const raporService = {
  fetchFilterOptions: async () => {
    const store = useRaporStore()
    try {
      const [classroomRes, semesterRes] = await Promise.all([
        classroomApi.getClassrooms({ limit: 100 }),
        semesterApi.getSemesters({ limit: 100 }),
      ])
      store.classrooms = classroomRes.data?.data ?? []
      store.semesters = semesterRes.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat opsi filter.'))
    }
  },

  fetchRapors: async () => {
    const store = useRaporStore()

    if (!store.selectedClassroomId || !store.selectedSemesterId) {
      store.rapors = []
      store.totalItems = 0
      return
    }

    store.loading = true
    try {
      const params: RaporQueryParams = {
        limit: 100,
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
      }
      const res = await raporApi.getRapors(params)
      store.rapors = res.data?.data ?? []
      store.totalItems = res.data?.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data rapor.'))
    } finally {
      store.loading = false
    }
  },

  generateRapor: async (payload: GenerateRaporPayload) => {
    const store = useRaporStore()
    store.isSaving = true
    try {
      const promise = raporApi.generateRapor(payload)
      toast.promise(promise, {
        loading: 'Sedang men-generate rapor...',
        success: 'Rapor berhasil di-generate.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal men-generate rapor.'),
      })
      await promise
      await raporService.fetchRapors()
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  bulkGenerateRapor: async () => {
    const store = useRaporStore()
    const { selectedClassroomId, selectedSemesterId } = store

    if (!selectedClassroomId || !selectedSemesterId) {
      toast.error('Pilih kelas dan semester terlebih dahulu.')
      return { success: false }
    }

    store.isGenerating = true
    try {
      const promise = raporApi.bulkGenerateRapor({
        classroomId: selectedClassroomId,
        semesterId: selectedSemesterId,
      })
      toast.promise(promise, {
        loading: 'Sedang men-generate semua rapor...',
        success: (res: { data: BulkGenerateResult }) =>
          `Berhasil men-generate ${res.data.generated} rapor dari ${res.data.totalStudents} siswa.`,
        error: (err: unknown) =>
          getIndonesianErrorMessage(
            err,
            'Gagal men-generate rapor secara massal.',
          ),
      })
      await promise
      await raporService.fetchRapors()
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      store.isGenerating = false
    }
  },

  fetchRaporDetail: async (id: string) => {
    try {
      const res = await raporApi.getRaporDetail(id)
      return res.data
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat detail rapor.'),
      )
      return null
    }
  },

  updateRapor: async (id: string, payload: UpdateRaporPayload) => {
    const store = useRaporStore()
    store.isSaving = true
    try {
      const promise = raporApi.updateRapor(id, payload)
      toast.promise(promise, {
        loading: 'Menyimpan perubahan rapor...',
        success: 'Rapor berhasil diperbarui.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal memperbarui rapor.'),
      })
      await promise
      await raporService.fetchRapors()
      return { success: true }
    } catch {
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  publishRapor: async (id: string) => {
    try {
      const promise = raporApi.publishRapor(id)
      toast.promise(promise, {
        loading: 'Mempublish rapor...',
        success: 'Rapor berhasil dipublish.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(err, 'Gagal mempublish rapor.'),
      })
      await promise
      await raporService.fetchRapors()
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  togglePublish: async (id: string, currentlyPublished: boolean) => {
    try {
      const promise = raporApi.updateRapor(id, {
        isPublished: !currentlyPublished,
      })
      toast.promise(promise, {
        loading: currentlyPublished
          ? 'Meng-unpublish rapor...'
          : 'Mempublish rapor...',
        success: currentlyPublished
          ? 'Rapor berhasil di-unpublish.'
          : 'Rapor berhasil dipublish.',
        error: (err: unknown) =>
          getIndonesianErrorMessage(
            err,
            'Gagal mengubah status publish rapor.',
          ),
      })
      await promise
      await raporService.fetchRapors()
      return { success: true }
    } catch {
      return { success: false }
    }
  },

  fetchScoresForRapor: async (
    enrollmentId: string,
  ): Promise<RaporScoreRow[]> => {
    try {
      const res = await studentScoreApi.getScores({ enrollmentId, limit: 100 })
      const rawScores = res.data?.data ?? []
      return rawScores.map(
        (s: StudentScoreItem): RaporScoreRow => ({
          subject: s.assessmentItem?.name ?? '-',
          type: s.assessmentItem?.type ?? '-',
          score: s.score,
          weight: s.assessmentItem?.weight ?? 1,
        }),
      )
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data nilai.'))
      return []
    }
  },

  exportReportCard: async (id: string, studentName: string) => {
    const toastId = toast.loading('Sedang mengunduh berkas PDF rapor...')
    try {
      const res = await raporApi.exportReportCard(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `Rapor-${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Rapor PDF berhasil diunduh.', { id: toastId })
      return { success: true }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal mengunduh berkas PDF rapor.'),
        { id: toastId },
      )
      return { success: false }
    }
  },
}
