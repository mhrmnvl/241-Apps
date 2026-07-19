import { EMPTY_ORGANIZATION } from './constants'
import type { Organization } from './types'

export function formatValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return '-'
  return trimmed
}

export function toOrganization(
  data: Partial<Organization> | null | undefined,
): Organization {
  return {
    id: data?.id,
    name: data?.name ?? EMPTY_ORGANIZATION.name,
    code: data?.code ?? EMPTY_ORGANIZATION.code,
    email: data?.email ?? EMPTY_ORGANIZATION.email,
    phoneNumber: data?.phoneNumber ?? EMPTY_ORGANIZATION.phoneNumber,
    isActive: data?.isActive ?? EMPTY_ORGANIZATION.isActive,
    schoolUnits: data?.schoolUnits,
  }
}

const organizationKeys: (keyof Organization)[] = [
  'name',
  'code',
  'email',
  'phoneNumber',
]

export function hasOrganizationProfileChanges(
  current: Organization,
  draft: Organization,
) {
  return organizationKeys.some((key) => {
    return (
      (current[key] ?? '').toString().trim() !==
      (draft[key] ?? '').toString().trim()
    )
  })
}
