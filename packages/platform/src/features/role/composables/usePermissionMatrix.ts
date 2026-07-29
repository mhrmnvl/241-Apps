import { type Ref, computed, ref, watch } from 'vue'
import type { Permission } from '../types'

const MODULE_LABELS: Record<string, string> = {
  // akademik
  'academic-calendar-types': 'Tipe Kalender Akademik',
  'academic-calendars': 'Kalender Akademik',
  'academic-years': 'Tahun Ajaran',
  'academic-year': 'Tahun Ajaran',
  'assessment-items': 'Penilaian & Tugas',
  attendances: 'Kehadiran',
  classrooms: 'Kelas',
  'class-levels': 'Tingkat Kelas',
  'class-level': 'Tingkat Kelas',
  curricula: 'Kurikulum',
  'curriculum-subjects': 'Mata Pelajaran Kurikulum',
  enrollments: 'Pendaftaran Kelas',
  events: 'Kegiatan',
  graduations: 'Kelulusan & Alumni',
  lessons: 'Jadwal Pelajaran',
  'report-cards': 'Rapor',
  schedules: 'Jadwal Pelajaran',
  semesters: 'Semester',
  'student-scores': 'Nilai Siswa',
  subjects: 'Mata Pelajaran',
  'teaching-assignments': 'Penugasan Mengajar',
  'time-slots': 'Jam Pelajaran',
  'time-slot-types': 'Tipe Jam Pelajaran',
  // penerimaan
  'admission-announcements': 'Pengumuman Penerimaan',
  'admission-waves': 'Gelombang Penerimaan',
  admissions: 'Penerimaan Siswa',
  // pengguna & akses
  permissions: 'Hak Akses',
  roles: 'Role & Hak Akses',
  sessions: 'Sesi Login',
  users: 'Pengguna',
  // sdm
  parents: 'Orang Tua',
  students: 'Siswa',
  teachers: 'Guru',
  // profil & riwayat
  achievements: 'Prestasi',
  'achievement-types': 'Tipe Prestasi',
  'educational-histories': 'Riwayat Pendidikan',
  educations: 'Pendidikan',
  'employment-types': 'Status Kepegawaian',
  occupations: 'Pekerjaan',
  positions: 'Jabatan',
  'position-categories': 'Kategori Jabatan',
  profiles: 'Profil',
  'social-media': 'Media Sosial',
  // master data
  'blood-types': 'Golongan Darah',
  religions: 'Agama',
  scholarships: 'Beasiswa',
  // sistem & lainnya
  announcements: 'Pengumuman',
  'audit-logs': 'Log Aktivitas',
  dashboards: 'Dasbor',
  files: 'Berkas',
  inventory: 'Inventaris',
  'school-units': 'Unit Sekolah',
  settings: 'Pengaturan',
  tenants: 'Tenant',
}

export function translateModule(mod: string): string {
  if (MODULE_LABELS[mod]) return MODULE_LABELS[mod]
  return mod
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getPermissionOrder(code: string): number {
  const lower = code.toLowerCase()
  if (lower.endsWith('.read')) return 1
  if (lower.endsWith('.create')) return 2
  if (lower.endsWith('.update')) return 3
  if (lower.endsWith('.delete')) return 4
  if (lower.includes('read')) return 1
  if (lower.includes('create')) return 2
  if (lower.includes('update')) return 3
  if (lower.includes('delete')) return 4
  return 5
}

export function translatePermission(
  code: string,
  description?: string,
): string {
  const lower = code.toLowerCase()
  if (lower.endsWith('.read')) return 'Lihat'
  if (lower.endsWith('.create')) return 'Tambah'
  if (lower.endsWith('.update')) return 'Edit'
  if (lower.endsWith('.delete')) return 'Hapus'

  const parts = lower.split('.')
  const suffix = parts[parts.length - 1] ?? ''
  if (suffix === 'read') return 'Lihat'
  if (suffix === 'create') return 'Tambah'
  if (suffix === 'update') return 'Edit'
  if (suffix === 'delete') return 'Hapus'
  if (suffix === 'manage') return 'Kelola'
  if (suffix === 'import') return 'Impor'
  if (suffix === 'export') return 'Ekspor'
  if (suffix === 'download') return 'Unduh'
  if (suffix === 'upload') return 'Unggah'
  if (suffix === 'print') return 'Cetak'
  if (suffix === 'approve') return 'Setujui'
  if (suffix === 'reject') return 'Tolak'

  return description ?? suffix.charAt(0).toUpperCase() + suffix.slice(1)
}

export function usePermissionMatrix(
  permissions: Ref<Permission[]>,
  permissionIds: Ref<string[]>,
) {
  const expandedGroups = ref<Record<string, boolean>>({})
  const searchQuery = ref('')

  watch(
    permissions,
    (newPerms) => {
      if (newPerms.length > 0) {
        const groups: Record<string, boolean> = {}
        newPerms.forEach((perm) => {
          const mod = perm.module ?? 'Lainnya'
          groups[translateModule(mod)] = true
        })
        expandedGroups.value = groups
      }
    },
    { immediate: true },
  )

  function toggleGroup(moduleName: string) {
    expandedGroups.value[moduleName] = !expandedGroups.value[moduleName]
  }

  const filteredGroupedPermissions = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    const groups: Record<string, Permission[]> = {}

    permissions.value.forEach((perm) => {
      const mod = perm.module ?? 'Lainnya'
      const translatedMod = translateModule(mod)
      const matchesQuery =
        !query ||
        (perm.description ?? '').toLowerCase().includes(query) ||
        perm.code.toLowerCase().includes(query) ||
        mod.toLowerCase().includes(query) ||
        translatedMod.toLowerCase().includes(query)

      if (matchesQuery) {
        groups[translatedMod] ??= []
        groups[translatedMod].push(perm)
      }
    })

    for (const groupName in groups) {
      groups[groupName]?.sort(
        (a, b) => getPermissionOrder(a.code) - getPermissionOrder(b.code),
      )
    }

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'id')),
    )
  })

  const totalFilteredPermissionsCount = computed(() => {
    return Object.values(filteredGroupedPermissions.value).flat().length
  })

  function isAllModuleSelected(modulePerms: Permission[]): boolean {
    if (modulePerms.length === 0) return false
    return modulePerms.every((p) => permissionIds.value.includes(p.id))
  }

  function isSomeModuleSelected(modulePerms: Permission[]): boolean {
    const selected = modulePerms.filter((p) =>
      permissionIds.value.includes(p.id),
    )
    return selected.length > 0 && selected.length < modulePerms.length
  }

  function toggleModuleAll(
    modulePerms: Permission[],
    checked: boolean | 'indeterminate',
  ) {
    const currentIds = [...permissionIds.value]
    const moduleIds = modulePerms.map((p) => p.id)

    permissionIds.value =
      checked === true
        ? [...new Set([...currentIds, ...moduleIds])]
        : currentIds.filter((id) => !moduleIds.includes(id))
  }

  function togglePermission(id: string) {
    const currentIds = [...permissionIds.value]
    const index = currentIds.indexOf(id)
    if (index > -1) {
      currentIds.splice(index, 1)
    } else {
      currentIds.push(id)
    }
    permissionIds.value = currentIds
  }

  function selectAll() {
    if (searchQuery.value) {
      const filteredIds = Object.values(filteredGroupedPermissions.value)
        .flat()
        .map((p) => p.id)
      permissionIds.value = [
        ...new Set([...permissionIds.value, ...filteredIds]),
      ]
    } else {
      permissionIds.value = permissions.value.map((p) => p.id)
    }
  }

  function deselectAll() {
    if (searchQuery.value) {
      const filteredIds = Object.values(filteredGroupedPermissions.value)
        .flat()
        .map((p) => p.id)
      permissionIds.value = permissionIds.value.filter(
        (id) => !filteredIds.includes(id),
      )
    } else {
      permissionIds.value = []
    }
  }

  return {
    expandedGroups,
    searchQuery,
    filteredGroupedPermissions,
    totalFilteredPermissionsCount,
    toggleGroup,
    isAllModuleSelected,
    isSomeModuleSelected,
    toggleModuleAll,
    togglePermission,
    selectAll,
    deselectAll,
  }
}
