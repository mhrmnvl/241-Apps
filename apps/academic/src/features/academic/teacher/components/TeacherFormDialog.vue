<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import api from '@/shared/utils/api'
import type {
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherEditData,
  PositionListItem,
  PositionCategoryRef,
  EmploymentTypeOption,
} from '../types'
import { positionCategoryLabel } from '../utils'
import { DatePicker } from '@/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: TeacherEditData | null
  positions?: PositionListItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: TeacherSavePayload | TeacherUpdatePayload]
  'save-position': [
    teacherId: string,
    positionId: string,
    oldPositionLinkId: string | null,
  ]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) resetForm()
    emit('update:open', value)
  },
})

const { editData } = toRefs(props)
const isEditing = computed(() => !!editData?.value)

const _activeTab = ref('profil')
const activeTab = computed({
  get: () => _activeTab.value,
  set: (val) => {
    if (val === 'kepegawaian') {
      void validateProfilFields().then((valid) => {
        if (valid) _activeTab.value = val
      })
      return
    }
    _activeTab.value = val
  },
})

const showConfirmAlert = ref(false)

const kategori = ref('')
const originalPositionId = ref('')
const originalPositionLinkId = ref<string | null>(null)

const employmentTypes = ref<EmploymentTypeOption[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ data: EmploymentTypeOption[] }>(
      '/employment-types',
      {
        params: { limit: 100 },
      },
    )
    employmentTypes.value = res.data.data ?? []
  } catch {
    // non-blocking
  }
})

const categoryOptions = computed(() => {
  const map = new Map<string, PositionCategoryRef>()
  for (const p of props.positions ?? []) {
    if (p.category) map.set(p.category.id, p.category)
  }
  return [...map.values()]
})

const filteredPositions = computed(() => {
  const list = props.positions ?? []
  if (!kategori.value) return list
  return list.filter((p) => p.category?.id === kategori.value)
})

const profilFields = [
  'name',
  'nik',
  'gender',
  'birthPlace',
  'birthDate',
  'email',
  'phone',
] as const

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Mohon masukkan nama lengkap guru.')
      .max(100, 'Nama tidak boleh lebih dari 100 karakter.'),
    nik: z
      .string()
      .min(1, 'Nomor Induk Kependudukan (NIK) wajib diisi.')
      .length(16, 'NIK harus berjumlah tepat 16 digit angka.'),
    gender: z.string().min(1, 'Silakan pilih jenis kelamin guru.'),
    birthPlace: z
      .string()
      .min(1, 'Kota tempat lahir wajib dicantumkan.')
      .max(100, 'Tempat lahir tidak boleh lebih dari 100 karakter.'),
    birthDate: z.string().min(1, 'Mohon tentukan tanggal lahir guru.'),
    email: z
      .string()
      .max(255, 'Email tidak boleh lebih dari 255 karakter.')
      .email('Format alamat email tidak valid (contoh: nama@email.com).')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(15, 'Nomor HP tidak boleh lebih dari 15 digit.')
      .optional()
      .or(z.literal('')),
    nip: z
      .string()
      .max(20, 'NIP tidak boleh lebih dari 20 karakter.')
      .optional()
      .or(z.literal('')),
    nuptk: z
      .string()
      .max(20, 'NUPTK tidak boleh lebih dari 20 karakter.')
      .optional()
      .or(z.literal('')),
    employmentTypeId: z
      .string()
      .min(1, 'Silakan pilih status kepegawaian saat ini.'),
    positionId: z.string().optional().default(''),
  }),
)

const {
  handleSubmit,
  resetForm,
  setValues,
  setFieldValue,
  values: formValues,
  validateField,
} = useForm({
  validationSchema: formSchema,
  keepValuesOnUnmount: true,
  initialValues: {
    name: '',
    nik: '',
    gender: 'MALE',
    birthPlace: '',
    birthDate: '',
    email: '',
    phone: '',
    nip: '',
    nuptk: '',
    employmentTypeId: '',
    positionId: '',
  },
})

watch(
  () => [props.open, editData?.value],
  () => {
    if (props.open) {
      const data = editData?.value
      _activeTab.value = data ? 'kepegawaian' : 'profil'
      showConfirmAlert.value = false
      kategori.value = ''
      if (data) {
        const primaryPos = data.teacherPositions?.find((ep) => ep.isPrimary)
        if (primaryPos) {
          originalPositionId.value = primaryPos.position?.id ?? ''
          originalPositionLinkId.value = primaryPos.id ?? null
          kategori.value = primaryPos.position?.category?.id ?? ''
        } else {
          originalPositionId.value = ''
          originalPositionLinkId.value = null
        }
        setValues({
          name: data.user?.profile?.name ?? '',
          nik: data.user?.profile?.nik ?? '',
          gender: data.user?.profile?.gender ?? 'MALE',
          birthPlace: data.user?.profile?.birthPlace ?? '',
          birthDate: data.user?.profile?.birthDate
            ? data.user.profile.birthDate.substring(0, 10)
            : '',
          email: data.user?.profile?.email ?? '',
          phone: data.user?.profile?.phone ?? '',
          nip: data.nip ?? '',
          nuptk: data.nuptk ?? '',
          employmentTypeId:
            data.employmentTypeId ?? data.employmentType?.id ?? '',
          positionId: primaryPos?.position?.id ?? '',
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

async function validateProfilFields(): Promise<boolean> {
  const results = await Promise.all(
    profilFields.map((field) => validateField(field)),
  )
  return results.every((r) => r.valid)
}

function handleNext() {
  if (isEditing.value) {
    emitSave(formValues)
    return
  }

  if (activeTab.value === 'profil') {
    void validateProfilFields().then((valid) => {
      if (valid) _activeTab.value = 'kepegawaian'
    })
  } else if (activeTab.value === 'kepegawaian') {
    void handleSubmit((values) => {
      emitSave(values)
    })()
  }
}

function handleBack() {
  if (isEditing.value) {
    open.value = false
    return
  }

  if (activeTab.value === 'kepegawaian') _activeTab.value = 'profil'
  else open.value = false
}

function confirmSave() {
  showConfirmAlert.value = false
  void handleSubmit((values) => {
    emitSave(values)
  })()
}

function emitSave(values: Record<string, unknown>) {
  if (isEditing.value) {
    const newPositionId = (values.positionId as string) || ''

    const updatePayload: TeacherUpdatePayload = {
      nip: (values.nip as string) || undefined,
      nuptk: (values.nuptk as string) || undefined,
      employmentTypeId: values.employmentTypeId as string,
    }
    emit('save', updatePayload)

    if (newPositionId && newPositionId !== originalPositionId.value) {
      const teacherId = editData?.value?.id
      if (teacherId) {
        emit(
          'save-position',
          teacherId,
          newPositionId,
          originalPositionLinkId.value,
        )
      }
    }
    return
  }

  const payload: TeacherSavePayload = {
    name: values.name as string,
    nik: values.nik as string,
    gender: values.gender as 'MALE' | 'FEMALE',
    birthPlace: values.birthPlace as string,
    birthDate: values.birthDate as string,
    employmentTypeId: values.employmentTypeId as string,
    positionId: (values.positionId as string) || undefined,
    identifier: (values.nip as string) || (values.nik as string),
    password: (values.nip as string) || (values.nik as string),
    email: (values.email as string) || undefined,
    phone: (values.phone as string) || undefined,
    nip: (values.nip as string) || undefined,
    nuptk: (values.nuptk as string) || undefined,
  }

  emit('save', payload)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col gap-0 border-l p-0"
    >
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle class="text-xl">
          {{ isEditing ? 'Edit Data Guru' : 'Tambah Guru Baru' }}
        </DialogTitle>
      </DialogHeader>

      <Tabs
        v-model="activeTab"
        class="flex-1 w-full flex flex-col min-h-0"
      >
        <div
          :class="[
            'border-b shrink-0 z-10 bg-background shadow-sm',
            isEditing
              ? 'h-0 w-0 overflow-hidden absolute opacity-0 border-b-0 pointer-events-none'
              : 'px-6 pt-4 pb-2',
          ]"
        >
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger
              value="profil"
              :class="activeTab === 'profil' ? 'bg-background shadow-sm' : ''"
            >
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="kepegawaian"
              :class="
                activeTab === 'kepegawaian' ? 'bg-background shadow-sm' : ''
              "
            >
              Instansi
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea class="flex-1 min-h-0">
          <div class="px-6 py-4">
            <TabsContent
              v-if="!isEditing"
              value="profil"
              class="mt-0"
            >
              <div class="grid gap-5 md:grid-cols-2 p-1">
                <FormField
                  v-slot="{ componentField }"
                  name="name"
                >
                  <FormItem class="md:col-span-2 content-start">
                    <FormLabel
                      >Nama Lengkap
                      <span class="text-destructive">*</span></FormLabel
                    >
                    <FormControl>
                      <Input
                        placeholder="Budi Santoso, S.Pd"
                        maxlength="100"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ componentField }"
                  name="nik"
                >
                  <FormItem class="content-start">
                    <FormLabel
                      >NIK <span class="text-destructive">*</span></FormLabel
                    >
                    <FormControl>
                      <Input
                        placeholder="16 digit NIK"
                        maxlength="16"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ value, handleChange }"
                  name="gender"
                >
                  <FormItem class="content-start">
                    <FormLabel
                      >Jenis Kelamin
                      <span class="text-destructive">*</span></FormLabel
                    >
                    <Select
                      :model-value="value"
                      @update:model-value="handleChange"
                    >
                      <FormControl>
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE"> Laki-laki </SelectItem>
                        <SelectItem value="FEMALE"> Perempuan </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ componentField }"
                  name="birthPlace"
                >
                  <FormItem class="content-start">
                    <FormLabel
                      >Tempat Lahir
                      <span class="text-destructive">*</span></FormLabel
                    >
                    <FormControl>
                      <Input
                        placeholder="Surabaya"
                        maxlength="100"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ value, handleChange }"
                  name="birthDate"
                >
                  <FormItem class="content-start">
                    <FormLabel
                      >Tanggal Lahir
                      <span class="text-destructive">*</span></FormLabel
                    >
                    <FormControl>
                      <DatePicker
                        :model-value="value"
                        placeholder="Pilih tanggal lahir"
                        @update:model-value="handleChange"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ componentField }"
                  name="email"
                >
                  <FormItem class="content-start">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contoh@email.com (ops/)"
                        maxlength="255"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ componentField }"
                  name="phone"
                >
                  <FormItem class="content-start">
                    <FormLabel>No. HP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789 (ops/)"
                        maxlength="15"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </TabsContent>

            <TabsContent
              value="kepegawaian"
              class="mt-0"
            >
              <div class="grid gap-5 md:grid-cols-2 p-1">
                <FormField
                  v-slot="{ componentField }"
                  name="nip"
                >
                  <FormItem class="content-start">
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan NIP (opsional)"
                        maxlength="20"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ componentField }"
                  name="nuptk"
                >
                  <FormItem class="content-start">
                    <FormLabel>NUPTK</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Punya NUPTK? (opsional)"
                        maxlength="20"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <div class="space-y-2 content-start">
                  <label class="text-sm font-medium leading-none">
                    Kategori
                    <span class="text-xs font-normal text-muted-foreground"
                      >(filter)</span
                    >
                  </label>
                  <Select
                    :model-value="kategori"
                    @update:model-value="
                      (v) => {
                        kategori = String(v ?? '')
                        setFieldValue('positionId', '')
                      }
                    "
                  >
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="cat in categoryOptions"
                        :key="cat.id"
                        :value="cat.id"
                      >
                        {{ positionCategoryLabel(cat.code, cat.name) }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormField
                  v-slot="{ value, handleChange }"
                  name="positionId"
                >
                  <FormItem class="content-start">
                    <FormLabel>
                      Jabatan Utama
                      <span class="text-xs font-normal text-muted-foreground"
                        >(opsional)</span
                      >
                    </FormLabel>
                    <Select
                      :model-value="value"
                      @update:model-value="handleChange"
                    >
                      <FormControl>
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Pilih jabatan..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="pos in filteredPositions"
                          :key="pos.id"
                          :value="pos.id"
                        >
                          {{ pos.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField
                  v-slot="{ value, handleChange }"
                  name="employmentTypeId"
                >
                  <FormItem class="content-start">
                    <FormLabel
                      >Status Kepegawaian
                      <span class="text-destructive">*</span></FormLabel
                    >
                    <Select
                      :model-value="value"
                      @update:model-value="handleChange"
                    >
                      <FormControl>
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="Pilih status saat ini" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="et in employmentTypes"
                          :key="et.id"
                          :value="et.id"
                        >
                          {{ et.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </TabsContent>
          </div>

          <p
            v-if="formError"
            class="text-sm font-medium text-destructive mt-6 mx-1 mb-1 bg-red-50 p-3 rounded border border-red-100"
          >
            {{ formError }}
          </p>
        </ScrollArea>
      </Tabs>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background relative mt-auto"
      >
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="handleBack"
        >
          {{ isEditing || activeTab === 'profil' ? 'Batal' : 'Kembali' }}
        </Button>

        <template v-if="!isEditing">
          <Button
            v-if="activeTab !== 'kepegawaian'"
            variant="default"
            @click="handleNext"
          >
            Lanjut
          </Button>
          <Button
            v-else
            variant="default"
            :disabled="isSaving"
            @click="handleNext"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </template>
        <template v-else>
          <Button
            variant="default"
            :disabled="isSaving"
            @click="handleNext"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan Data?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin memperbarui data guru ini? Pastikan data yang
          dimasukkan sudah benar sebelum disimpan ke database.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="isSaving"
          @click="showConfirmAlert = false"
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isSaving"
          @click="confirmSave"
        >
          Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
