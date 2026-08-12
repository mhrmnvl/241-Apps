import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { lookupService } from '@/features/lookup'
import { salaryAssignmentApi } from '../api/salaryAssignmentApi'
import type {
  EmployeeOption,
  SalaryAssignment,
  SalaryAssignmentSavePayload,
} from '../types'

export const assignments = ref<SalaryAssignment[]>([])
export const employees = ref<EmployeeOption[]>([])
export const selectedUserId = ref<string | null>(null)
export const loading = ref(false)
export const isSaving = ref(false)

/**
 * What is in force today, and what it replaced.
 *
 * A superseded row is closed rather than deleted, so the history is what
 * explains how an earlier payslip reached its figure. Showing both in one list
 * would bury the answer to "what is this person paid right now".
 */
export const currentAssignments = computed(() =>
  assignments.value.filter((assignment) => assignment.effectiveTo === null),
)

export const supersededAssignments = computed(() =>
  assignments.value.filter((assignment) => assignment.effectiveTo !== null),
)

export const salaryAssignmentService = {
  fetchEmployees: async () => {
    try {
      employees.value = await lookupService.listEmployees()
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pegawai.'),
      )
      employees.value = []
    }
  },

  fetch: async (userId?: string) => {
    loading.value = true
    try {
      const res = await salaryAssignmentApi.getAssignments(userId)
      assignments.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat gaji pegawai.'),
      )
      assignments.value = []
    } finally {
      loading.value = false
    }
  },

  save: async (payload: SalaryAssignmentSavePayload) => {
    isSaving.value = true
    try {
      await salaryAssignmentApi.createAssignment(payload)
      // Not an edit: the previous amount is closed the day before this one
      // starts, so an earlier month still recalculates to its original figure.
      toast.success(
        'Gaji ditetapkan. Nilai sebelumnya disimpan sebagai riwayat.',
      )
      await salaryAssignmentService.fetch(payload.userId)
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menetapkan gaji.'))
      return false
    } finally {
      isSaving.value = false
    }
  },

  remove: async (assignment: SalaryAssignment) => {
    try {
      await salaryAssignmentApi.deleteAssignment(assignment.id)
      toast.success('Penetapan gaji dihapus.')
      await salaryAssignmentService.fetch(assignment.userId)
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus penetapan gaji.'),
      )
      return false
    }
  },
}
