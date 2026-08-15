export interface Permission {
  id: string
  code: string
  module?: string | null
  action?: string | null
  description?: string | null
  /**
   * Which application this permission belongs to, decided by the backend.
   *
   * Not derived here on purpose. It cannot be read off the code's name — four
   * presence modules carry no `presence-` prefix, so a prefix-based grouping
   * files the leave system under academic and hands it to an academic
   * administrator. The server knows where the code lives; the browser does not.
   */
  app?: PermissionApp | null
}

/** Mirrors the backend's `PermissionApp`. */
export type PermissionApp =
  | 'academic'
  | 'presence'
  | 'payroll'
  | 'admission'
  | 'inventory'
  | 'portal'
  | 'platform'

/** Ordered as the role screen shows them: the school's work first. */
export const PERMISSION_APP_LABELS: { key: PermissionApp; label: string }[] = [
  { key: 'academic', label: 'Akademik' },
  { key: 'presence', label: 'Presensi' },
  { key: 'payroll', label: 'Penggajian' },
  { key: 'admission', label: 'PPDB' },
  { key: 'inventory', label: 'Inventaris' },
  { key: 'portal', label: 'Portal' },
  { key: 'platform', label: 'Sistem' },
]

export interface Role {
  id: string
  code: string
  name: string
  description?: string | null
  isSystem: boolean
  permissions: Permission[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRolePayload {
  code: string
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRolePayload {
  name: string
  description?: string
  permissionIds?: string[]
}
