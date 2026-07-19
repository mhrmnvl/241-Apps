import { storeToRefs } from 'pinia'
import { useAddressStore } from '../stores/addressStore'
import { addressService } from '../services/addressService'

export function useAddress() {
  const store = useAddressStore()

  const { isSaving } = storeToRefs(store)

  return {
    isSaving,
    saveAddress: addressService.saveAddress,
  }
}
