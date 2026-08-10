import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { deviceApi } from '../api/deviceApi'
import type {
  DeviceWithToken,
  GateDevice,
  RegisterDevicePayload,
} from '../types'

export const devices = ref<GateDevice[]>([])
export const loading = ref(false)
/** Memory-only: the plaintext token is unrecoverable once the dialog closes. */
export const lastIssued = ref<DeviceWithToken | null>(null)

export const deviceService = {
  fetch: async () => {
    loading.value = true
    try {
      const res = await deviceApi.getDevices({ limit: 100 })
      devices.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat perangkat.'))
    } finally {
      loading.value = false
    }
  },

  register: async (payload: RegisterDevicePayload) => {
    try {
      const res = await deviceApi.register(payload)
      lastIssued.value = res.data?.data ?? null
      toast.success('Perangkat terdaftar. Salin tokennya sekarang.')
      await deviceService.fetch()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal mendaftarkan perangkat.'),
      )
      return false
    }
  },

  rotate: async (id: string) => {
    try {
      const res = await deviceApi.rotateToken(id)
      lastIssued.value = res.data?.data ?? null
      toast.success(
        'Token baru diterbitkan. Token lama langsung tidak berlaku.',
      )
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menerbitkan token baru.'),
      )
      return false
    }
  },

  clearIssued: () => {
    lastIssued.value = null
  },
}
