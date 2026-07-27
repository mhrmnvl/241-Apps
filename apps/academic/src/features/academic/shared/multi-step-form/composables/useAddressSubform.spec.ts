import { describe, it, expect } from 'vitest'
import { useAddressSubform } from './useAddressSubform'

describe('useAddressSubform', () => {
  it('defaults to no address (street empty)', () => {
    const { hasAddress } = useAddressSubform()
    expect(hasAddress.value).toBe(false)
  })

  it('defaults country to Indonesia', () => {
    const { address } = useAddressSubform()
    expect(address.value.country).toBe('Indonesia')
  })

  it('treats a whitespace-only street as no address', () => {
    const { address, hasAddress } = useAddressSubform()
    address.value.street = '   '
    expect(hasAddress.value).toBe(false)
  })

  it('considers an address present once street is filled', () => {
    const { address, hasAddress } = useAddressSubform()
    address.value.street = 'Jl. Merdeka'
    expect(hasAddress.value).toBe(true)
  })

  it('validateAddress passes when no address is entered', () => {
    const { validateAddress } = useAddressSubform()
    expect(validateAddress()).toBe(true)
  })

  it('validateAddress fails when address is entered but required fields are missing', () => {
    const { address, validateAddress } = useAddressSubform()
    address.value.street = 'Jl. Merdeka'
    expect(validateAddress()).toBe(false)
  })

  it('validateAddress passes once all required fields are filled', () => {
    const { address, validateAddress } = useAddressSubform()
    address.value.street = 'Jl. Merdeka'
    address.value.village = 'Sukamaju'
    address.value.district = 'Cikole'
    address.value.city = 'Bandung'
    address.value.province = 'Jawa Barat'
    expect(validateAddress()).toBe(true)
  })
})
