<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Checkbox } from '@/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  X,
} from 'lucide-vue-next'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types'

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']

const props = defineProps<{
  editData?: Role | null
  isSaving: boolean
  formError: string | null
  permissions: Permission[]
  isLoadingPermissions: boolean
}>()

const emit = defineEmits<{
  cancel: []
  save: [data: CreateRolePayload | UpdateRolePayload]
}>()

const isEditing = computed(() => !!props.editData)
const isSystemRole = computed(() => {
  if (!props.editData) return false
  return props.editData.isSystem
    ? true
    : SYSTEM_ROLES.includes(props.editData.code)
})

const expandedGroups = ref<Record<string, boolean>>({})
const searchQuery = ref('')
const permissionIds = ref<string[]>([])

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama Role wajib diisi.'),
    code: z
      .string()
      .min(1, 'Kode Role wajib diisi.')
      .regex(
        /^[A-Z0-9_]+$/,
        'Kode Role hanya boleh berisi huruf besar, angka, dan underscore.',
      ),
    description: z.string().optional().default(''),
  }),
)

const { handleSubmit, resetForm, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    code: '',
    description: '',
  },
})

watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      setValues({
        name: newData.name ?? '',
        code: newData.code ?? '',
        description: newData.description ?? '',
      })
      permissionIds.value = newData.permissions?.map((p) => p.id) ?? []
    } else {
      resetForm()
      permissionIds.value = []
    }
  },
  { immediate: true },
)

function translateModule(mod: string): string {
  const mapping: Record<string, string> = {
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
  if (mapping[mod]) return mapping[mod]
  return mod
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPermissionOrder(code: string): number {
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

function translatePermission(code: string, description?: string): string {
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

// Auto-expand groups when permissions load
watch(
  () => props.permissions,
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

const toggleGroup = (moduleName: string) => {
  expandedGroups.value[moduleName] = !expandedGroups.value[moduleName]
}

// Group and filter permissions based on search query
const filteredGroupedPermissions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const groups: Record<string, Permission[]> = {}

  props.permissions.forEach((perm) => {
    const mod = perm.module ?? 'Lainnya'
    const translatedMod = translateModule(mod)
    const matchesQuery =
      !query ||
      (perm.description ?? '').toLowerCase().includes(query) ||
      perm.code.toLowerCase().includes(query) ||
      mod.toLowerCase().includes(query) ||
      translatedMod.toLowerCase().includes(query)

    if (matchesQuery) {
      if (!groups[translatedMod]) {
        groups[translatedMod] = []
      }
      groups[translatedMod].push(perm)
    }
  })

  // Sort permissions inside each group by CRUD order (Lihat → Tambah → Edit → Hapus)
  for (const groupName in groups) {
    groups[groupName]?.sort(
      (a, b) => getPermissionOrder(a.code) - getPermissionOrder(b.code),
    )
  }

  // Sort module groups A-Z by Indonesian label
  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, 'id')),
  )
})

const totalFilteredPermissionsCount = computed(() => {
  return Object.values(filteredGroupedPermissions.value).flat().length
})

const isAllModuleSelected = (modulePerms: Permission[]) => {
  if (modulePerms.length === 0) return false
  return modulePerms.every((p) => permissionIds.value.includes(p.id))
}

const isSomeModuleSelected = (modulePerms: Permission[]) => {
  const selected = modulePerms.filter((p) => permissionIds.value.includes(p.id))
  return selected.length > 0 && selected.length < modulePerms.length
}

const toggleModuleAll = (
  modulePerms: Permission[],
  checked: boolean | 'indeterminate',
) => {
  const currentIds = [...permissionIds.value]
  const moduleIds = modulePerms.map((p) => p.id)

  let newIds: string[]
  if (checked === true) {
    newIds = [...new Set([...currentIds, ...moduleIds])]
  } else {
    newIds = currentIds.filter((id) => !moduleIds.includes(id))
  }
  permissionIds.value = newIds
}

const togglePermission = (id: string) => {
  const currentIds = [...permissionIds.value]
  const index = currentIds.indexOf(id)
  if (index > -1) {
    currentIds.splice(index, 1)
  } else {
    currentIds.push(id)
  }
  permissionIds.value = currentIds
}

const selectAll = () => {
  if (searchQuery.value) {
    const filteredIds = Object.values(filteredGroupedPermissions.value)
      .flat()
      .map((p) => p.id)
    permissionIds.value = [...new Set([...permissionIds.value, ...filteredIds])]
  } else {
    permissionIds.value = props.permissions.map((p) => p.id)
  }
}

const deselectAll = () => {
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

const showConfirmAlert = ref(false)

function buildPayload() {
  if (isEditing.value) {
    const payload: UpdateRolePayload = {
      name: values.name ?? '',
      description: values.description ?? '',
      permissionIds: permissionIds.value,
    }
    return payload
  } else {
    const payload: CreateRolePayload = {
      name: values.name ?? '',
      code: (values.code ?? '').toUpperCase(),
      description: values.description ?? '',
      permissionIds: permissionIds.value,
    }
    return payload
  }
}

const onSubmit = handleSubmit(() => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', buildPayload())
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  emit('save', buildPayload())
}
</script>

<template>
  <form
    class="flex flex-col h-full gap-0"
    @submit.prevent="onSubmit"
  >
    <div class="px-6 pb-6 pt-8 space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Role Details Card -->
        <div class="lg:col-span-1">
          <Card
            class="rounded-2xl border border-border/80 shadow-sm shadow-black/5 flex flex-col gap-0"
          >
            <CardHeader
              class="border-b px-6 py-4 lg:py-0 lg:h-[72px] flex flex-row items-center shrink-0"
            >
              <CardTitle class="text-lg font-bold">Detail Role</CardTitle>
            </CardHeader>
            <CardContent class="px-6 pt-4 pb-6 space-y-4">
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem>
                  <FormLabel class="font-semibold">
                    Nama Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama role"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="code"
              >
                <FormItem>
                  <FormLabel class="font-semibold">
                    Kode Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan kode role"
                      v-bind="componentField"
                      :disabled="isEditing"
                      @input="
                        (e: any) =>
                          setValues({ code: e.target.value.toUpperCase() })
                      "
                    />
                  </FormControl>
                  <p
                    v-if="isEditing"
                    class="text-xs text-muted-foreground mt-1"
                  >
                    <span class="text-amber-600 font-medium block mt-1">
                      Kode role tidak dapat diubah setelah dibuat.
                    </span>
                  </p>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="description"
              >
                <FormItem>
                  <FormLabel class="font-semibold">Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan deskripsi"
                      rows="3"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div
                v-if="isSystemRole"
                class="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300"
              >
                <Info class="size-5 shrink-0 text-amber-600" />
                <div class="space-y-1">
                  <p
                    class="font-semibold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400"
                  >
                    Role Sistem
                  </p>
                  <p
                    class="text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed"
                  >
                    Ini adalah role bawaan sistem. Hak akses dapat
                    dikonfigurasi, namun kode role dilindungi dan tidak dapat
                    dihapus.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Permissions Checklist Card -->
        <div class="lg:col-span-1">
          <Card
            class="rounded-2xl border border-border/80 shadow-sm shadow-black/5 flex flex-col gap-0"
          >
            <CardHeader
              class="border-b px-6 py-4 lg:py-0 lg:h-[72px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0"
            >
              <div class="flex items-center min-w-0">
                <CardTitle class="text-lg font-bold"
                  >Hak Akses -
                  {{ permissionIds?.length ?? 0 }} Terpilih</CardTitle
                >
              </div>

              <div class="flex items-center gap-2 justify-end w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-8 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/10 hover:text-primary"
                  @click="selectAll"
                >
                  Pilih Semua
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="h-8 text-xs font-semibold text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  @click="deselectAll"
                >
                  Batal Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent class="px-6 pt-4 pb-6 space-y-4">
              <!-- Search Filter -->
              <div class="relative">
                <Search
                  class="absolute left-3 top-2.5 size-4 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari modul atau hak akses..."
                  class="pl-9"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  @click="searchQuery = ''"
                >
                  <X class="size-4" />
                </button>
              </div>

              <!-- Permissions List -->
              <div
                v-if="isLoadingPermissions"
                class="flex flex-col items-center justify-center py-12 space-y-2"
              >
                <span class="text-sm text-muted-foreground animate-pulse"
                  >Memuat daftar hak akses...</span
                >
              </div>

              <div
                v-else-if="permissions.length === 0"
                class="text-center py-12 text-muted-foreground text-sm"
              >
                Tidak ada data hak akses yang tersedia.
              </div>

              <div
                v-else-if="totalFilteredPermissionsCount === 0"
                class="text-center py-12 text-muted-foreground text-sm"
              >
                Tidak ada hak akses yang cocok dengan pencarian "{{
                  searchQuery
                }}".
              </div>

              <div
                v-else
                class="space-y-4 max-h-[500px] overflow-y-auto pr-1"
              >
                <div
                  v-for="(
                    modulePerms, moduleName
                  ) in filteredGroupedPermissions"
                  :key="moduleName"
                  class="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs transition-all duration-200"
                  :class="{
                    'border-primary/20 ring-1 ring-primary/5':
                      expandedGroups[moduleName],
                  }"
                >
                  <!-- Group Header -->
                  <div
                    class="flex items-center justify-between px-4 py-3 bg-muted/10 border-b"
                  >
                    <div class="flex items-center gap-3 min-w-0 flex-1 mr-2">
                      <Checkbox
                        :model-value="
                          isAllModuleSelected(modulePerms)
                            ? true
                            : isSomeModuleSelected(modulePerms)
                              ? 'indeterminate'
                              : false
                        "
                        class="shrink-0"
                        @update:model-value="
                          (val: boolean | 'indeterminate') =>
                            toggleModuleAll(modulePerms, val)
                        "
                      />
                      <span class="font-semibold text-sm select-none">{{
                        moduleName
                      }}</span>
                      <span
                        class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold whitespace-nowrap shrink-0"
                      >
                        {{
                          modulePerms.filter((p) =>
                            permissionIds.includes(p.id),
                          ).length
                        }}
                        / {{ modulePerms.length }}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 text-muted-foreground hover:text-foreground"
                      @click="toggleGroup(moduleName)"
                    >
                      <ChevronUp
                        v-if="expandedGroups[moduleName]"
                        class="size-4"
                      />
                      <ChevronDown
                        v-else
                        class="size-4"
                      />
                    </Button>
                  </div>

                  <!-- Group Content -->
                  <div
                    v-show="expandedGroups[moduleName]"
                    class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-card/50"
                  >
                    <div
                      v-for="perm in modulePerms"
                      :key="perm.id"
                      class="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
                      @click="togglePermission(perm.id)"
                    >
                      <Checkbox
                        :model-value="permissionIds.includes(perm.id)"
                        class="shrink-0"
                        @click.stop
                        @update:model-value="() => togglePermission(perm.id)"
                      />
                      <div class="select-none flex-1">
                        <div
                          class="text-xs font-semibold tracking-tight leading-none"
                        >
                          {{
                            translatePermission(
                              perm.code,
                              perm.description ?? undefined,
                            )
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Alert Form Error -->
      <div v-if="formError">
        <Alert
          variant="destructive"
          class="rounded-xl"
        >
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Kesalahan Sistem</AlertTitle>
          <AlertDescription>{{ formError }}</AlertDescription>
        </Alert>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div
      class="flex items-center justify-between border-t px-6 py-4 bg-background shrink-0 mt-auto"
    >
      <Button
        type="button"
        variant="outline"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        Batal
      </Button>
      <Button
        type="submit"
        variant="default"
        :disabled="isSaving || isLoadingPermissions"
      >
        <div
          v-if="isSaving"
          class="size-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
        />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Role & Hak Akses' }}
      </Button>
    </div>
  </form>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent class="rounded-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada hak akses role ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="showConfirmAlert = false"
        >
          Batal
        </Button>
        <Button
          variant="default"
          :disabled="isSaving"
          @click="confirmSave"
        >
          {{ isSaving ? 'Menyimpan...' : 'Ya, Simpan' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
