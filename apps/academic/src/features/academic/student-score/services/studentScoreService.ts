import { studentScoreApi } from '../api/studentScoreApi'
import { useStudentScoreStore } from '../stores/studentScoreStore'
import type { StudentScoreRosterItem } from '../types'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/features/platform/auth'
import { toast } from 'vue-sonner'

export const studentScoreService = {
  fetchRoster: async (assessmentItemId: string) => {
    const store = useStudentScoreStore()
    store.loading = true
    try {
      const res = await studentScoreApi.getRoster(assessmentItemId)
      store.assessmentItem = res.data?.data.assessmentItem ?? null
      store.roster = res.data?.data.items ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data penilaian.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveRoster: async (
    assessmentItemId: string,
    rows: StudentScoreRosterItem[],
  ) => {
    const store = useStudentScoreStore()
    store.isSaving = true
    store.formError = null
    try {
      const records = rows
        .filter(
          (row) =>
            (row.score !== null && row.score !== undefined) ||
            (row.note?.trim().length ?? 0) > 0,
        )
        .map((row) => ({
          enrollmentId: row.enrollmentId,
          score: row.score ?? undefined,
          note: row.note?.trim() ? row.note.trim() : undefined,
        }))

      if (records.length === 0) {
        return { success: true }
      }

      // Which route the caller may use is a question about their permissions,
      // not their role. `student-scores.manage` grades any class in the school;
      // `student-scores.manage-assigned` grades the subjects they teach and the
      // classroom they supervise, and the server settles which is which from
      // their teaching records.
      const { can } = useRoleGuard()
      if (can('student-scores.manage')) {
        await studentScoreApi.bulkUpsertScores({ assessmentItemId, records })
      } else {
        await studentScoreApi.bulkUpsertAssignedScores({
          assessmentItemId,
          records,
        })
      }
      await studentScoreService.fetchRoster(assessmentItemId)
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan nilai siswa.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },
}
