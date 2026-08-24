import { EMPTY_ADDRESS, EMPTY_SCHOOL_UNIT } from './constants'
import type { SchoolUnitAddress, SchoolUnitProfile } from './types'

export function formatValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return '-'
  return trimmed
}

export function toSchoolUnitProfile(
  data: Partial<SchoolUnitProfile> | null | undefined,
): SchoolUnitProfile {
  return {
    id: data?.id,
    name: data?.name ?? EMPTY_SCHOOL_UNIT.name,
    surname: data?.surname ?? EMPTY_SCHOOL_UNIT.surname,
    nsm: data?.nsm ?? EMPTY_SCHOOL_UNIT.nsm,
    npsn: data?.npsn ?? EMPTY_SCHOOL_UNIT.npsn,
    status: data?.status ?? EMPTY_SCHOOL_UNIT.status,
    typeId:
      data?.typeId ??
      (data?.type && typeof data.type === 'object' ? data.type.id : null),
    type: data?.type && typeof data.type === 'object' ? data.type : null,
    npwp: data?.npwp ?? EMPTY_SCHOOL_UNIT.npwp,
    phone: data?.phone ?? EMPTY_SCHOOL_UNIT.phone,
    email: data?.email ?? EMPTY_SCHOOL_UNIT.email,
    website: data?.website ?? EMPTY_SCHOOL_UNIT.website,
  }
}

/**
 * A pin exists only when both halves of it do.
 *
 * Asked of an address, which is what holds the coordinate. The profile map
 * asks it of the primary address and draws nothing when the answer is no —
 * it never looks for a pin on some other address the school may have.
 */
export function hasCoordinates(
  address: Pick<SchoolUnitAddress, 'latitude' | 'longitude'>,
): boolean {
  return (
    typeof address.latitude === 'number' &&
    typeof address.longitude === 'number'
  )
}

/** Six decimals is about 10 cm — past that the digits are noise on a map. */
export function formatCoordinate(value: number | null): string {
  return typeof value === 'number' ? value.toFixed(6) : '-'
}

export function toSchoolUnitAddress(
  data: Partial<SchoolUnitAddress> | null | undefined,
): SchoolUnitAddress {
  return {
    street: data?.street ?? EMPTY_ADDRESS.street,
    rt: data?.rt ?? EMPTY_ADDRESS.rt,
    rw: data?.rw ?? EMPTY_ADDRESS.rw,
    village: data?.village ?? EMPTY_ADDRESS.village,
    district: data?.district ?? EMPTY_ADDRESS.district,
    city: data?.city ?? EMPTY_ADDRESS.city,
    province: data?.province ?? EMPTY_ADDRESS.province,
    country: data?.country ?? EMPTY_ADDRESS.country,
    postalCode: data?.postalCode ?? EMPTY_ADDRESS.postalCode,
    // `??` rather than `||`: 0 is a real coordinate — the equator and the
    // prime meridian — and would otherwise be read as "no pin".
    latitude: data?.latitude ?? null,
    longitude: data?.longitude ?? null,
  }
}

export function buildFullAddress(address: SchoolUnitAddress) {
  const rtRw = [
    address.rt && `RT ${address.rt}`,
    address.rw && `RW ${address.rw}`,
  ]
    .filter(Boolean)
    .join(' / ')

  const parts = [
    address.street,
    rtRw,
    address.village,
    address.district,
    address.city,
    address.province,
    address.country,
    address.postalCode,
  ]
    .map((part) => (part ? String(part).trim() : ''))
    .filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : '-'
}

const schoolUnitProfileKeys: (keyof SchoolUnitProfile)[] = [
  'name',
  'surname',
  'nsm',
  'npsn',
  'status',
  'typeId',
  'npwp',
  'phone',
  'email',
  'website',
]

const schoolUnitAddressKeys: (keyof SchoolUnitAddress)[] = [
  'street',
  'rt',
  'rw',
  'village',
  'district',
  'city',
  'province',
  'country',
  'postalCode',
  'latitude',
  'longitude',
]

export function hasSchoolUnitProfileChanges(
  current: SchoolUnitProfile,
  draft: SchoolUnitProfile,
) {
  return schoolUnitProfileKeys.some((key) => {
    return (
      (current[key] ?? '').toString().trim() !==
      (draft[key] ?? '').toString().trim()
    )
  })
}

export function hasSchoolUnitAddressChanges(
  current: SchoolUnitAddress,
  draft: SchoolUnitAddress,
) {
  return schoolUnitAddressKeys.some((key) => {
    return (
      (current[key] ?? '').toString().trim() !==
      (draft[key] ?? '').toString().trim()
    )
  })
}
