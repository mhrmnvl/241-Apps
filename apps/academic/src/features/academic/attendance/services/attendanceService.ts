import { attendanceApi } from '../api/attendanceApi'
import { useAttendanceStore } from '../stores/attendanceStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'
import { useReferenceList } from '@/features/platform/reference-data'
import { classroomApi } from '@/features/academic/classroom'
import { semesterApi } from '@/features/academic/semester'
import { studentEnrollmentApi } from '@/features/academic/classroom'
import type { StudentEnrollment } from '@/features/academic/classroom'
import type { AttendanceInputRow, BulkUpsertAttendancePayload } from '../types'

export const attendanceService = {
  fetchFilterOptions: async () => {
    const store = useAttendanceStore()
    try {
      const [classrooms, semesters] = await Promise.all([
        useReferenceList().read('classrooms', async () => {
          const res = await classroomApi.getClassrooms({
            limit: PAGINATION.REFERENCE_LIMIT,
          })
          return res.data?.data ?? []
        }),
        useReferenceList().read('semesters', async () => {
          const res = await semesterApi.getSemesters({
            limit: PAGINATION.REFERENCE_LIMIT,
          })
          return res.data?.data ?? []
        }),
      ])
      store.classrooms = classrooms
      store.semesters = semesters
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
        limit: PAGINATION.CHILD_ENTITY_LIMIT,
      })
      const enrollments: StudentEnrollment[] = enrollmentRes.data?.data ?? []

      const attendanceRes = await attendanceApi.getAttendances({
        classroomId: store.selectedClassroomId,
        date: store.selectedDate,
        limit: PAGINATION.CHILD_ENTITY_LIMIT,
      })
      const existingAttendances = attendanceRes.data?.data ?? []

      const attendanceMap = new Map(
        existingAttendances.map((a) => [a.enrollmentId, a]),
      )

      // What the gate saw, as a suggestion. Never persisted here — the
      // teacher's save is the only thing that writes (FR-020, research R6).
      const gate = await attendanceService.loadGateSuggestions()
      const suggestionMap = new Map(
        gate.suggestions.map((s) => [s.enrollmentId, s]),
      )
      const unscanned = new Set(gate.unscannedEnrollmentIds)

      store.inputRows = enrollments.map((enrollment): AttendanceInputRow => {
        const existing = attendanceMap.get(enrollment.id)
        const suggestion = suggestionMap.get(enrollment.id)

        // A saved record is the teacher's own value and always wins — a later
        // gate flush must never overwrite a decision already made (research R6).
        const status =
          existing?.status ??
          (suggestion?.suggestedStatus === 'LATE' ? 'LATE' : 'PRESENT')

        return {
          enrollmentId: enrollment.id,
          studentName: enrollment.student?.user?.profile?.name ?? '-',
          nis: enrollment.student?.nis ?? '-',
          status,
          note: existing?.note ?? '',
          existingId: existing?.id,
          fromGate: !existing && Boolean(suggestion),
          gateCheckInAt: suggestion?.checkInAt ?? null,
          needsDecision: !existing && unscanned.has(enrollment.id),
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

  /**
   * Presence being unavailable must not stop a teacher taking attendance. The
   * backend already degrades to an empty suggestion set; this catch covers the
   * request itself failing.
   */
  loadGateSuggestions: async () => {
    const store = useAttendanceStore()
    try {
      const res = await attendanceApi.getGateSuggestions({
        classroomId: store.selectedClassroomId,
        semesterId: store.selectedSemesterId,
        date: store.selectedDate,
      })
      const data = res.data?.data
      store.gateAvailable = data?.available ?? false
      return {
        suggestions: data?.suggestions ?? [],
        unscannedEnrollmentIds: data?.unscannedEnrollmentIds ?? [],
      }
    } catch {
      store.gateAvailable = false
      return { suggestions: [], unscannedEnrollmentIds: [] }
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
