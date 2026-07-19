export interface AddressSavePayload {
  street: string
  rt?: string | null
  rw?: string | null
  village: string
  district: string
  city: string
  province: string
  postalCode?: string | null
  country: string
  isPrimary?: boolean
}
