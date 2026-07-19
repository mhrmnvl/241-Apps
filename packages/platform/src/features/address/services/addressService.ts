import { useAddressStore } from '../stores/addressStore'
import { addressApi } from '../api/addressApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { AddressSavePayload } from '../types'

export const addressService = {
  saveAddress: async (
    payload: AddressSavePayload,
    isCreate: boolean,
    addressId?: string,
  ) => {
    const store = useAddressStore()
    store.isSaving = true
    try {
      if (isCreate) {
        await addressApi.createMyAddress(payload)
      } else {
        await addressApi.updateMyAddress(addressId!, payload)
      }
      toast.success('Berhasil', {
        description: 'Data alamat Anda berhasil diperbarui',
      })
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal memperbarui alamat', {
        description: getIndonesianErrorMessage(
          err,
          'Terjadi kesalahan saat menyimpan data.',
        ),
      })
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },
}
