import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { payrollRunApi } from '../api/payrollRunApi'
import type {
  CreatePayrollRunPayload,
  PayrollRun,
  PayslipSummary,
} from '../types'

export const runs = ref<PayrollRun[]>([])
export const currentRun = ref<PayrollRun | null>(null)
export const payslips = ref<PayslipSummary[]>([])
export const loading = ref(false)
export const isWorking = ref(false)

/**
 * The 422 that names employees with no salary carries them in
 * `response.data.employees`. Surfacing the list is the whole value of that
 * refusal — "gagal menghitung" alone leaves the operator with nowhere to go.
 */
export function unconfiguredEmployees(error: unknown): string[] {
  const body = (
    error as { response?: { data?: { employees?: unknown } } } | undefined
  )?.response?.data?.employees

  return Array.isArray(body) ? body.map(String) : []
}

export const payrollRunService = {
  fetch: async (year?: number) => {
    loading.value = true
    try {
      const res = await payrollRunApi.getRuns(year ? { year } : undefined)
      runs.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat riwayat penggajian.'),
      )
      runs.value = []
    } finally {
      loading.value = false
    }
  },

  fetchDetail: async (id: string) => {
    loading.value = true
    try {
      const [run, slips] = await Promise.all([
        payrollRunApi.getRun(id),
        payrollRunApi.getRunPayslips(id),
      ])
      currentRun.value = run.data?.data ?? null
      payslips.value = slips.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat penggajian.'))
      currentRun.value = null
      payslips.value = []
    } finally {
      loading.value = false
    }
  },

  create: async (payload: CreatePayrollRunPayload) => {
    isWorking.value = true
    try {
      const res = await payrollRunApi.createRun(payload)
      toast.success('Penggajian dihitung sebagai draf.')
      return res.data?.data ?? null
    } catch (error: unknown) {
      const unconfigured = unconfiguredEmployees(error)
      if (unconfigured.length > 0) {
        toast.error(
          `Belum punya komponen gaji: ${unconfigured.join(', ')}. Tetapkan dulu, jangan dibayar nol.`,
        )
      } else {
        toast.error(
          getIndonesianErrorMessage(error, 'Gagal menghitung penggajian.'),
        )
      }
      return null
    } finally {
      isWorking.value = false
    }
  },

  recalculate: async (id: string) => {
    isWorking.value = true
    try {
      const res = await payrollRunApi.recalculateRun(id)
      const run = res.data?.data ?? null
      const changed = run?.previousDraft?.changedPayslips.length ?? 0
      toast.success(
        changed === 0
          ? 'Dihitung ulang. Tidak ada nilai yang berubah.'
          : `Dihitung ulang. ${changed} slip gaji berubah.`,
      )
      currentRun.value = run
      await payrollRunService.refreshPayslips(id)
      return run
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghitung ulang.'))
      return null
    } finally {
      isWorking.value = false
    }
  },

  submit: async (id: string) => {
    isWorking.value = true
    try {
      const res = await payrollRunApi.submitRun(id)
      currentRun.value = res.data?.data ?? currentRun.value
      toast.success('Penggajian diajukan untuk persetujuan.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengajukan.'))
      return false
    } finally {
      isWorking.value = false
    }
  },

  approve: async (id: string) => {
    isWorking.value = true
    try {
      const res = await payrollRunApi.approveRun(id)
      currentRun.value = res.data?.data ?? currentRun.value
      toast.success('Penggajian disetujui dan menjadi final.')
      return true
    } catch (error: unknown) {
      // Self-approval and an already-approved run are both refused by the API
      // with their own message, which is more use than a generic one.
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyetujui.'))
      return false
    } finally {
      isWorking.value = false
    }
  },

  refreshPayslips: async (id: string) => {
    try {
      const res = await payrollRunApi.getRunPayslips(id)
      payslips.value = res.data?.data ?? []
    } catch {
      // The run itself is already on screen; a failed payslip refresh must not
      // replace it with an error state.
      payslips.value = []
    }
  },
}
