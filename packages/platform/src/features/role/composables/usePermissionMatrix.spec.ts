import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import type { Permission } from '../types'
import {
  usePermissionMatrix,
  translateModule,
  getPermissionOrder,
  translatePermission,
} from './usePermissionMatrix'

describe('translateModule', () => {
  it('translates a known module code', () => {
    expect(translateModule('students')).toBe('Siswa')
  })

  it('humanizes an unknown module code as a fallback', () => {
    expect(translateModule('some-unknown-module')).toBe('Some Unknown Module')
  })
})

describe('getPermissionOrder', () => {
  it('orders read before create before update before delete', () => {
    expect(getPermissionOrder('students.read')).toBeLessThan(
      getPermissionOrder('students.create'),
    )
    expect(getPermissionOrder('students.create')).toBeLessThan(
      getPermissionOrder('students.update'),
    )
    expect(getPermissionOrder('students.update')).toBeLessThan(
      getPermissionOrder('students.delete'),
    )
  })

  it('orders unrecognized actions last', () => {
    expect(getPermissionOrder('students.approve')).toBe(5)
  })
})

describe('translatePermission', () => {
  it('translates known CRUD suffixes', () => {
    expect(translatePermission('students.read')).toBe('Lihat')
    expect(translatePermission('students.create')).toBe('Tambah')
  })

  it('falls back to the description for an unrecognized suffix', () => {
    expect(translatePermission('students.custom', 'Kustom')).toBe('Kustom')
  })
})

function makePermission(overrides: Partial<Permission> = {}): Permission {
  return {
    id: 'perm-1',
    code: 'students.read',
    module: 'students',
    description: null,
    app: 'academic',
    ...overrides,
  }
}

describe('usePermissionMatrix', () => {
  it('groups by application first, then by module', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1', code: 'students.read', module: 'students' }),
      makePermission({ id: 'p2', code: 'teachers.read', module: 'teachers' }),
    ])
    const { filteredGroupedPermissions } = usePermissionMatrix(
      permissions,
      ref([]),
    )

    expect(Object.keys(filteredGroupedPermissions.value)).toEqual([
      'Akademik · Guru',
      'Akademik · Siswa',
    ])
  })

  it('sorts permissions within a group by CRUD order', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1', code: 'students.delete', module: 'students' }),
      makePermission({ id: 'p2', code: 'students.read', module: 'students' }),
      makePermission({ id: 'p3', code: 'students.create', module: 'students' }),
    ])
    const { filteredGroupedPermissions } = usePermissionMatrix(
      permissions,
      ref([]),
    )

    expect(
      filteredGroupedPermissions.value['Akademik · Siswa']?.map((p) => p.id),
    ).toEqual(['p2', 'p3', 'p1'])
  })

  /**
   * The reason the application is decided by the server rather than read off
   * the code's name. `leave-requests` belongs to presence and carries no
   * `presence-` prefix, so a name-based grouping puts the leave system under
   * Akademik — and an operator building "Admin Akademik" grants it without
   * ever seeing what they granted.
   */
  it('keeps an unprefixed presence module out of the academic group', () => {
    const permissions = ref<Permission[]>([
      makePermission({
        id: 'p1',
        code: 'leave-requests.read',
        module: 'leave-requests',
        app: 'presence',
      }),
      makePermission({ id: 'p2', code: 'students.read', module: 'students' }),
    ])
    const { filteredGroupedPermissions } = usePermissionMatrix(
      permissions,
      ref([]),
    )

    const keys = Object.keys(filteredGroupedPermissions.value)
    expect(keys.some((k) => k.startsWith('Presensi · '))).toBe(true)
    expect(
      keys.some((k) => k.startsWith('Akademik · ') && k.includes('Cuti')),
    ).toBe(false)
  })

  /**
   * Ordering is not cosmetic here: the group an operator should hand out
   * sparingly sits last, after the school's own work, so it is not the first
   * thing skimmed past.
   */
  it('puts the system group last', () => {
    const permissions = ref<Permission[]>([
      makePermission({
        id: 'p1',
        code: 'roles.read',
        module: 'roles',
        app: 'platform',
      }),
      makePermission({ id: 'p2', code: 'students.read', module: 'students' }),
    ])
    const { filteredGroupedPermissions } = usePermissionMatrix(
      permissions,
      ref([]),
    )

    const keys = Object.keys(filteredGroupedPermissions.value)
    expect(keys[0]?.startsWith('Akademik')).toBe(true)
    expect(keys[keys.length - 1]?.startsWith('Sistem')).toBe(true)
  })

  it('filters by permission code, description, or module', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1', code: 'students.read', module: 'students' }),
      makePermission({ id: 'p2', code: 'teachers.read', module: 'teachers' }),
    ])
    const { searchQuery, totalFilteredPermissionsCount } = usePermissionMatrix(
      permissions,
      ref([]),
    )

    searchQuery.value = 'guru'
    expect(totalFilteredPermissionsCount.value).toBe(1)
  })

  it('selectAll selects every permission when there is no active search', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1' }),
      makePermission({ id: 'p2', module: 'teachers' }),
    ])
    const permissionIds = ref<string[]>([])
    const { selectAll } = usePermissionMatrix(permissions, permissionIds)

    selectAll()

    expect(permissionIds.value).toEqual(['p1', 'p2'])
  })

  it('selectAll only selects the currently filtered permissions when searching', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1', code: 'students.read', module: 'students' }),
      makePermission({ id: 'p2', code: 'teachers.read', module: 'teachers' }),
    ])
    const permissionIds = ref<string[]>([])
    const { searchQuery, selectAll } = usePermissionMatrix(
      permissions,
      permissionIds,
    )

    searchQuery.value = 'guru'
    selectAll()

    expect(permissionIds.value).toEqual(['p2'])
  })

  it('deselectAll clears only the currently filtered permissions when searching', () => {
    const permissions = ref<Permission[]>([
      makePermission({ id: 'p1', code: 'students.read', module: 'students' }),
      makePermission({ id: 'p2', code: 'teachers.read', module: 'teachers' }),
    ])
    const permissionIds = ref<string[]>([])
    const { searchQuery, selectAll, deselectAll } = usePermissionMatrix(
      permissions,
      permissionIds,
    )

    selectAll()
    searchQuery.value = 'guru'
    deselectAll()

    expect(permissionIds.value).toEqual(['p1'])
  })

  it('toggleModuleAll selects the whole module, and isAllModuleSelected reflects it', () => {
    const modulePerms = [
      makePermission({ id: 'p1', module: 'students' }),
      makePermission({ id: 'p2', code: 'students.create', module: 'students' }),
    ]
    const permissions = ref<Permission[]>(modulePerms)
    const { toggleModuleAll, isAllModuleSelected, isSomeModuleSelected } =
      usePermissionMatrix(permissions, ref([]))

    expect(isAllModuleSelected(modulePerms)).toBe(false)

    toggleModuleAll(modulePerms, true)

    expect(isAllModuleSelected(modulePerms)).toBe(true)
    expect(isSomeModuleSelected(modulePerms)).toBe(false)
  })

  it('isSomeModuleSelected is true when only part of a module is selected', () => {
    const modulePerms = [
      makePermission({ id: 'p1', module: 'students' }),
      makePermission({ id: 'p2', code: 'students.create', module: 'students' }),
    ]
    const permissions = ref<Permission[]>(modulePerms)
    const { togglePermission, isSomeModuleSelected, isAllModuleSelected } =
      usePermissionMatrix(permissions, ref([]))

    togglePermission('p1')

    expect(isSomeModuleSelected(modulePerms)).toBe(true)
    expect(isAllModuleSelected(modulePerms)).toBe(false)
  })

  it('togglePermission adds then removes a single permission', () => {
    const permissions = ref<Permission[]>([makePermission({ id: 'p1' })])
    const permissionIds = ref<string[]>([])
    const { togglePermission } = usePermissionMatrix(permissions, permissionIds)

    togglePermission('p1')
    expect(permissionIds.value).toEqual(['p1'])

    togglePermission('p1')
    expect(permissionIds.value).toEqual([])
  })
})
