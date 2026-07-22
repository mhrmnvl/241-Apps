import { attendanceApi } from '../api/attendanceApi'
import { useAttendanceStore } from '../stores/attendanceStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { studentEnrollmentApi } from '@/features/academic/classroom'
import type { StudentEnrollment } from '@/features/academic/classroom'
import type { AttendanceInputRow, BulkUpsertAttendancePayload } from '../types'

export const attendanceService = {
  fetchFilterOptions: async () => {
    const store = useAttendanceStore()
    try {
      const [classroomRes, semesterRes] = await Promise.all([
        classroomApi.getClassrooms({ limit: 100 }),
        semesterApi.getSemesters({ limit: 100 }),
      ])
      store.classrooms = classroomRes.data?.data ?? []
      store.semesters = semesterRes.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data referensi.'),
      )
    }
  },

  loadAttendanceInput: async () => {
    const store = useAttendanceStore()
    if (
      !store.selectedClassroomId ||
      !store.selectedSemesterId ||
      !store.selectedDate
    ) {
      store.inputRows = []
      return
    }

    store.loading = true
    try {
      const enrollmentRes = await studentEnrollmentApi.getEnrollments({
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
        limit: 100,
      })
      const enrollments: StudentEnrollment[] = enrollmentRes.data?.data ?? []

      const attendanceRes = await attendanceApi.getAttendances({
        classroomId: store.selectedClassroomId,
        date: store.selectedDate,
        limit: 100,
      })
      const existingAttendances = attendanceRes.data?.data ?? []

      const attendanceMap = new Map(
        existingAttendances.map((a) => [a.enrollmentId, a]),
      )

      store.inputRows = enrollments.map((enrollment): AttendanceInputRow => {
        const existing = attendanceMap.get(enrollment.id)
        return {
          enrollmentId: enrollment.id,
          studentName: enrollment.student?.user?.profile?.name ?? '-',
          nis: enrollment.student?.nis ?? '-',
          status: existing?.status ?? 'PRESENT',
          note: existing?.note ?? '',
          existingId: existing?.id,
        }
      })
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data kehadiran.'),
      )
    } finally {
      store.loading = false
    }
  },

  bulkSaveAttendance: async () => {
    const store = useAttendanceStore()
    if (store.inputRows.length === 0) return { success: false }

    store.isSaving = true
    store.formError = null
    try {
      const payload: BulkUpsertAttendancePayload = {
        date: store.selectedDate,
        records: store.inputRows.map((row) => ({
          enrollmentId: row.enrollmentId,
          status: row.status,
          ...(row.note ? { note: row.note } : {}),
        })),
      }

      await attendanceApi.bulkUpsertAttendances(payload)
      toast.success('Kehadiran berhasil disimpan')

      await attendanceService.loadAttendanceInput()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan kehadiran.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  fetchRecap: async () => {
    const store = useAttendanceStore()
    if (!store.selectedClassroomId || !store.selectedSemesterId) {
      store.recapItems = []
      return
    }

    store.recapLoading = true
    try {
      const res = await attendanceApi.getRecap({
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
        month: store.selectedMonth,
        year: store.selectedYear,
      })
      store.recapItems = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memuat rekapitulasi kehadiran.',
        ),
      )
    } finally {
      store.recapLoading = false
    }
  },

  fetchTrend: async () => {
    const store = useAttendanceStore()
    if (!store.selectedClassroomId || !store.selectedSemesterId) {
      store.trendData = []
      return
    }

    store.trendLoading = true
    try {
      const res = await attendanceApi.getMonthlyTrend({
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
      })
      store.trendData = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat tren kehadiran.'),
      )
    } finally {
      store.trendLoading = false
    }
  },

  fetchRecapAndTrend: async () => {
    await Promise.all([
      attendanceService.fetchRecap(),
      attendanceService.fetchTrend(),
    ])
  },
}
