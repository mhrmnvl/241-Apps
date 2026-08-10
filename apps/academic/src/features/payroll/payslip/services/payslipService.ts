import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { payslipApi } from '../api/payslipApi'
import type { Payslip } from '../types'

export const payslip = ref<Payslip | null>(null)
export const loading = ref(false)
/** A 404 here is "not published yet", not a failure — worth saying plainly. */
export const notYetPublished = ref(false)

function isNotFound(error: unknown): boolean {
  return (
    (error as { response?: { status?: number } } | undefined)?.response
      ?.status === 404
  )
}

export const payslipService = {
  fetchMine: async (params?: { year?: number; month?: number }) => {
    loading.value = true
    notYetPublished.value = false
    try {
      const res = await payslipApi.getMyPayslip(params)
      payslip.value = res.data?.data ?? null
    } catch (error: unknown) {
      payslip.value = null
      if (isNotFound(error)) {
        notYetPublished.value = true
      } else {
        toast.error(
          getIndonesianErrorMessage(error, 'Gagal memuat slip gaji Anda.'),
        )
      }
    } finally {
      loading.value = false
    }
  },

  fetchById: async (id: string) => {
    loading.value = true
    notYetPublished.value = false
    try {
      const res = await payslipApi.getPayslip(id)
      payslip.value = res.data?.data ?? null
    } catch (error: unknown) {
      payslip.value = null
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat slip gaji.'))
    } finally {
      loading.value = false
    }
  },
}
