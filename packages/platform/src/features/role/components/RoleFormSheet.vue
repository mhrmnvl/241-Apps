<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { rolesApi } from '../api/rolesApi'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Checkbox } from '@/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-vue-next'

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: Role | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: CreateRolePayload | UpdateRolePayload]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) resetForm()
    emit('update:open', value)
  },
})

const isEditing = computed(() => !!props.editData)
const isSystemRole = computed(() => {
  if (!props.editData) return false
  return props.editData.isSystem
    ? true
    : SYSTEM_ROLES.includes(props.editData.code)
})

const activeTab = ref('details')
const permissions = ref<Permission[]>([])
const isLoadingPermissions = ref(false)
const expandedGroups = ref<Record<string, boolean>>({})

// Group permissions by module
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}
  permissions.value.forEach((perm) => {
    const mod = perm.module ?? 'Lainnya'
    if (!groups[mod]) {
      groups[mod] = []
    }
    groups[mod].push(perm)
  })
  return groups
})

onMounted(async () => {
  isLoadingPermissions.value = true
  try {
    const res = await rolesApi.getPermissions()
    permissions.value = res.data?.data ?? []

    // Expand all groups by default
    const groups: Record<string, boolean> = {}
    permissions.value.forEach((perm) => {
      const mod = perm.module ?? 'Lainnya'
      groups[mod] = true
    })
    expandedGroups.value = groups
  } catch (err) {
    console.error('Gagal mengambil data permission:', err)
  } finally {
    isLoadingPermissions.value = false
  }
})

const toggleGroup = (moduleName: string) => {
  expandedGroups.value[moduleName] = !expandedGroups.value[moduleName]
}

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
    permissionIds: z.array(z.string()).default([]),
  }),
)

const { handleSubmit, resetForm, setValues, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    code: '',
    description: '',
    permissionIds: [] as string[],
  },
})

watch(
  () => [props.open, props.editData] as const,
  ([isOpen]) => {
    if (isOpen) {
      activeTab.value = 'details'
      const data = props.editData
      if (data) {
        setValues({
          name: data.name ?? '',
          code: data.code ?? '',
          description: data.description ?? '',
          permissionIds: data.permissions?.map((p) => p.id) ?? [],
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)

function buildPayload() {
  if (isEditing.value) {
    const payload: UpdateRolePayload = {
      name: values.name ?? '',
      description: values.description ?? '',
      permissionIds: values.permissionIds ?? [],
    }
    return payload
  } else {
    const payload: CreateRolePayload = {
      name: values.name ?? '',
      code: (values.code ?? '').toUpperCase(),
      description: values.description ?? '',
      permissionIds: values.permissionIds ?? [],
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

const isAllModuleSelected = (modulePerms: Permission[]) => {
  return modulePerms.every((p) => values.permissionIds?.includes(p.id))
}

const isSomeModuleSelected = (modulePerms: Permission[]) => {
  const selected = modulePerms.filter((p) =>
    values.permissionIds?.includes(p.id),
  )
  return selected.length > 0 && selected.length < modulePerms.length
}

const toggleModuleAll = (modulePerms: Permission[], checked: boolean) => {
  const currentIds = [...(values.permissionIds ?? [])]
  const moduleIds = modulePerms.map((p) => p.id)

  let newIds: string[]
  if (checked) {
    // Add all module IDs if not already present
    newIds = [...new Set([...currentIds, ...moduleIds])]
  } else {
    // Remove all module IDs
    newIds = currentIds.filter((id) => !moduleIds.includes(id))
  }

  setValues({ permissionIds: newIds })
}

const togglePermission = (id: string, checked: boolean) => {
  const currentIds = [...(values.permissionIds ?? [])]
  let newIds: string[]
  if (checked) {
    newIds = [...currentIds, id]
  } else {
    newIds = currentIds.filter((x) => x !== id)
  }
  setValues({ permissionIds: newIds })
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-xl flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEditing ? 'Edit Role & Hak Akses' : 'Tambah Role Baru' }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui data role dan kelola izin/hak akses yang diberikan.'
              : 'Masukkan data role baru beserta hak akses yang sesuai.'
          }}
        </SheetDescription>
      </SheetHeader>

      <Tabs
        v-model="activeTab"
        class="flex-1 flex flex-col min-h-0"
      >
        <div class="border-b px-6 py-2 bg-muted/5">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detail Role</TabsTrigger>
            <TabsTrigger value="permissions">
              Hak Akses ({{ values.permissionIds?.length ?? 0 }})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea class="flex-1 min-h-0">
          <form
            id="role-form"
            class="space-y-5 px-6 py-5"
            @submit.prevent="onSubmit"
          >
            <!-- Tab 1: Role Details -->
            <TabsContent
              value="details"
              class="space-y-4 m-0 border-0 p-0"
            >
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem>
                  <FormLabel>
                    Nama Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Staff Akademik"
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
                  <FormLabel>
                    Kode Role <span class="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: STAFF_AKADEMIK"
                      v-bind="componentField"
                      :disabled="isEditing"
                    />
                  </FormControl>
                  <p class="text-xs text-muted-foreground">
                    Kode unik berupa huruf besar, angka, dan underscore.
                    <span
                      v-if="isEditing"
                      class="text-amber-600 font-medium block mt-1"
                    >
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
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan kegunaan role ini..."
                      rows="3"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div
                v-if="isSystemRole"
                class="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300"
              >
                <Info class="size-5 shrink-0 text-amber-600" />
                <div class="space-y-1">
                  <p class="font-medium">Role Sistem</p>
                  <p class="text-xs text-amber-700/90 dark:text-amber-400">
                    Ini adalah role bawaan sistem. Hak akses dapat
                    dikonfigurasi, namun kode role dilindungi dan tidak dapat
                    dihapus.
                  </p>
                </div>
              </div>
            </TabsContent>

            <!-- Tab 2: Permissions checklist -->
            <TabsContent
              value="permissions"
              class="space-y-4 m-0 border-0 p-0"
            >
              <div
                v-if="isLoadingPermissions"
                class="flex flex-col items-center justify-center py-10 space-y-2"
              >
                <span class="text-sm text-muted-foreground animate-pulse"
                  >Memuat daftar hak akses...</span
                >
              </div>

              <div
                v-else-if="permissions.length === 0"
                class="text-center py-10 text-muted-foreground text-sm"
              >
                Tidak ada data hak akses yang tersedia.
              </div>

              <div
                v-else
                class="space-y-4"
              >
                <div
                  v-for="(modulePerms, moduleName) in groupedPermissions"
                  :key="moduleName"
                  class="border rounded-xl bg-card overflow-hidden shadow-sm transition-all duration-200"
                  :class="{
                    'border-primary/20 ring-1 ring-primary/5':
                      expandedGroups[moduleName],
                  }"
                >
                  <!-- Group Header -->
                  <div
                    class="flex items-center justify-between px-4 py-3 bg-muted/20 border-b"
                  >
                    <div class="flex items-center gap-3">
                      <Checkbox
                        :checked="isAllModuleSelected(modulePerms)"
                        :indeterminate="isSomeModuleSelected(modulePerms)"
                        @update:checked="
                          (val: boolean) => toggleModuleAll(modulePerms, val)
                        "
                      />
                      <span class="font-semibold text-sm">{{
                        moduleName
                      }}</span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-medium"
                      >
                        {{
                          modulePerms.filter((p) =>
                            values.permissionIds?.includes(p.id),
                          ).length
                        }}
                        / {{ modulePerms.length }} terpilih
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
                    class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-card"
                  >
                    <div
                      v-for="perm in modulePerms"
                      :key="perm.id"
                      class="flex items-start gap-3 p-3 rounded-lg border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors"
                      @click="
                        togglePermission(
                          perm.id,
                          !values.permissionIds?.includes(perm.id),
                        )
                      "
                    >
                      <Checkbox
                        :checked="values.permissionIds?.includes(perm.id)"
                        class="mt-0.5"
                        @click.stop
                        @update:checked="
                          (val: boolean) => togglePermission(perm.id, val)
                        "
                      />
                      <div class="space-y-0.5 select-none">
                        <div class="text-xs font-semibold tracking-tight">
                          {{ perm.name }}
                        </div>
                        <div
                          class="text-[10px] text-muted-foreground line-clamp-2 leading-normal"
                          :title="perm.description ?? perm.code"
                        >
                          {{ perm.description ?? perm.code }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <Alert
              v-if="formError"
              variant="destructive"
              class="mt-2"
            >
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Kesalahan Sistem</AlertTitle>
              <AlertDescription>{{ formError }}</AlertDescription>
            </Alert>
          </form>
        </ScrollArea>

        <SheetFooter
          class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="open = false"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="role-form"
            variant="default"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </SheetFooter>
      </Tabs>
    </SheetContent>
  </Sheet>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada role ini?
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
          Simpan
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
