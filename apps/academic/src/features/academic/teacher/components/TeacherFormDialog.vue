<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type {
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherEditData,
  PositionListItem,
} from '../types'
import {
  buildTeacherCreatePayload,
  buildTeacherUpdatePayload,
  resolvePositionChange,
} from '../utils'
import { useEmploymentTypeOptions } from '../composables/useEmploymentTypeOptions'
import { usePositionCategoryFilter } from '../composables/usePositionCategoryFilter'
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
import { ScrollArea } from '@/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import TeacherProfileTabFields from './TeacherProfileTabFields.vue'
import TeacherEmploymentTabFields from './TeacherEmploymentTabFields.vue'

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

const originalPositionId = ref('')
const originalPositionLinkId = ref<string | null>(null)

const { employmentTypes } = useEmploymentTypeOptions()
const positionsRef = computed(() => props.positions ?? [])
const { kategori, categoryOptions, filteredPositions } =
  usePositionCategoryFilter(positionsRef)

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
    emit('save', buildTeacherUpdatePayload(values))

    const positionChange = resolvePositionChange(
      editData?.value?.id,
      (values.positionId as string) || '',
      originalPositionId.value,
      originalPositionLinkId.value,
    )
    if (positionChange) {
      emit(
        'save-position',
        positionChange.teacherId,
        positionChange.positionId,
        positionChange.oldPositionLinkId,
      )
    }
    return
  }

  emit('save', buildTeacherCreatePayload(values))
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
              <TeacherProfileTabFields />
            </TabsContent>

            <TabsContent
              value="kepegawaian"
              class="mt-0"
            >
              <TeacherEmploymentTabFields
                v-model="kategori"
                :employment-types="employmentTypes"
                :category-options="categoryOptions"
                :filtered-positions="filteredPositions"
                @category-select="setFieldValue('positionId', '')"
              />
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
