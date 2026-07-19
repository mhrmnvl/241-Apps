import type { AddressRecord } from './address'
import type { AddressSavePayload } from './address-payload'

export interface AddressData {
  address?: AddressRecord | null
}

export interface EditAddressProps {
  open: boolean
  profileData?: { address?: AddressRecord | null } | null
}

export interface UseAddressFormOptions {
  props: EditAddressProps
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'reload'): void
  }
  saveAddress: (
    payload: AddressSavePayload,
    isCreate: boolean,
    addressId?: string,
  ) => Promise<{ success: boolean }>
}
