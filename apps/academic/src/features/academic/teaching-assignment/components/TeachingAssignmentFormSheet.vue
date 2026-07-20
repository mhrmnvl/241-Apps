<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useTeachingAssignment } from '../composables/useTeachingAssignment'
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
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { AlertCircle } from 'lucide-vue-next'
import type {
  TeachingAssignment,
  TeachingAssignmentSavePayload,
} from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: TeachingAssignment | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: TeachingAssignmentSavePayload]
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

const { teachers, subjects, classrooms, semesters } = useTeachingAssignment()

const teacherOptions = computed<ComboboxOption[]>(() =>
  teachers.value.map((e) => ({
    value: e.id,
    label: e.user?.profile?.name ?? e.nip ?? '-',
  })),
)

const subjectOptions = computed<ComboboxOption[]>(() =>
  subjects.value.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  })),
)

const classroomOptions = computed<ComboboxOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
)

const semesterOptions = computed<ComboboxOption[]>(() =>
  semesters.value.map((s) => ({
    value: s.id,
    label:
      `${s.type?.name === 'ODD' ? 'Ganjil' : 'Genap'} ${s.academicYear?.name ?? ''}`.trim(),
  })),
)

const formSchema = toTypedSchema(
  z.object({
    teacherId: z.string().min(1, 'Guru wajib dipilih.'),
    subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih.'),
    classroomId: z.string().min(1, 'Kelas wajib dipilih.'),
    semesterId: z.string().min(1, 'Semester wajib dipilih.'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    teacherId: '',
    subjectId: '',
    classroomId: '',
    semesterId: '',
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          teacherId: data.teacherId || '',
          subjectId: data.subjectId || '',
          classroomId: data.classroomId || '',
          semesterId: data.semesterId || '',
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
  teacherId: string
  subjectId: string
  classroomId: string
  semesterId: string
}): TeachingAssignmentSavePayload {
  return {
    teacherId: values.teacherId,
    subjectId: values.subjectId,
    classroomId: values.classroomId,
    semesterId: values.semesterId,
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
          {{
            isEditing ? 'Edit Penugasan Mengajar' : 'Tambah Penugasan Mengajar'
          }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui informasi penugasan mengajar.'
              : 'Masukkan informasi penugasan mengajar yang baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="teaching-assignment-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ value, handleChange }"
            name="teacherId"
          >
            <FormItem>
              <FormLabel>
                Guru Pengampu
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="teacherOptions"
                  placeholder="Pilih Guru Pengampu"
                  search-placeholder="Cari guru..."
                  empty-text="Guru tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="subjectId"
          >
            <FormItem>
              <FormLabel>
                Mata Pelajaran
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="subjectOptions"
                  placeholder="Pilih Mata Pelajaran"
                  search-placeholder="Cari mata pelajaran..."
                  empty-text="Mata pelajaran tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="classroomId"
          >
            <FormItem>
              <FormLabel>
                Kelas
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="classroomOptions"
                  placeholder="Pilih Kelas"
                  search-placeholder="Cari kelas..."
                  empty-text="Kelas tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="semesterId"
          >
            <FormItem>
              <FormLabel>
                Semester
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="semesterOptions"
                  placeholder="Pilih Semester"
                  search-placeholder="Cari semester..."
                  empty-text="Semester tidak ditemukan."
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
          form="teaching-assignment-form"
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
          Apakah Anda yakin ingin menyimpan perubahan pada penugasan mengajar
          ini?
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
