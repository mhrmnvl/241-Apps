<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useStudentGraduation } from '../composables/useStudentGraduation'
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { AlertCircle } from 'lucide-vue-next'
import type { StudentGraduation, StudentGraduationSavePayload } from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: StudentGraduation | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: StudentGraduationSavePayload]
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

const { students, academicYears } = useStudentGraduation()

const studentOptions = computed<ComboboxOption[]>(() => {
  const options = students.value.map((s) => ({
    value: s.id,
    label: `${s.nis} - ${s.user?.profile?.name ?? '-'}`,
  }))

  if (isEditing.value && editData?.value?.student) {
    const exists = options.some(
      (opt) => opt.value === editData.value?.studentId,
    )
    if (!exists && editData.value) {
      options.push({
        value: editData.value.studentId,
        label: `${editData.value.student.nis} - ${editData.value.student.user?.profile?.name ?? '-'}`,
      })
    }
  }

  return options
})

const academicYearOptions = computed<ComboboxOption[]>(() =>
  academicYears.value.map((ay) => ({
    value: ay.id,
    label: `${ay.name}${ay.isActive ? ' (Aktif)' : ''}`,
  })),
)

const formSchema = toTypedSchema(
  z.object({
    studentId: z.string().min(1, 'Siswa wajib dipilih.'),
    academicYearId: z.string().min(1, 'Tahun ajaran wajib dipilih.'),
    graduationDate: z.string().optional(),
    certificateNo: z.string().max(100, 'Maksimal 100 karakter.').optional(),
    note: z.string().optional(),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    studentId: '',
    academicYearId: '',
    graduationDate: '',
    certificateNo: '',
    note: '',
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          studentId: data.studentId ?? '',
          academicYearId: data.academicYearId ?? '',
          graduationDate: data.graduationDate?.split('T')[0] ?? '',
          certificateNo: data.certificateNo ?? '',
          note: data.note ?? '',
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)

function buildPayload(values: {
  studentId: string
  academicYearId: string
  graduationDate?: string
  certificateNo?: string
  note?: string
}): StudentGraduationSavePayload {
  return {
    studentId: values.studentId,
    academicYearId: values.academicYearId,
    ...(values.graduationDate
      ? { graduationDate: new Date(values.graduationDate).toISOString() }
      : {}),
    ...(values.certificateNo ? { certificateNo: values.certificateNo } : {}),
    ...(values.note ? { note: values.note } : {}),
  }
}

const onSubmit = handleSubmit((values) => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', buildPayload(values))
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  void handleSubmit((values) => {
    emit('save', buildPayload(values))
  })()
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEditing ? 'Edit Data Kelulusan' : 'Tambah Data Kelulusan' }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui informasi kelulusan siswa.'
              : 'Masukkan informasi kelulusan siswa yang baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="student-graduation-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ value, handleChange }"
            name="studentId"
          >
            <FormItem>
              <FormLabel>
                Siswa
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="studentOptions"
                  :disabled="isEditing"
                  placeholder="Pilih Siswa"
                  search-placeholder="Cari siswa..."
                  empty-text="Siswa tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="academicYearId"
          >
            <FormItem>
              <FormLabel>
                Tahun Ajaran Kelulusan
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="academicYearOptions"
                  placeholder="Pilih Tahun Ajaran"
                  search-placeholder="Cari tahun ajaran..."
                  empty-text="Tahun ajaran tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="graduationDate"
          >
            <FormItem>
              <FormLabel>Tanggal Lulus</FormLabel>
              <FormControl>
                <Input
                  :model-value="value"
                  type="date"
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="certificateNo"
          >
            <FormItem>
              <FormLabel>Nomor Ijazah</FormLabel>
              <FormControl>
                <Input
                  :model-value="value"
                  placeholder="Masukkan nomor ijazah"
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="note"
          >
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea
                  :model-value="value"
                  placeholder="Masukkan catatan..."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
          form="student-graduation-form"
          variant="default"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan pada data kelulusan ini?
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
