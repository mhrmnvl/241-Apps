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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
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
import { Checkbox } from '@/ui/checkbox'
import { AlertCircle } from 'lucide-vue-next'
import type {
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  TeachingAssignmentUpdatePayload,
} from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: TeachingAssignment | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [
    data: TeachingAssignmentCreatePayload | TeachingAssignmentUpdatePayload,
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

/**
 * Creating accepts many classes at once; editing targets the one row that was
 * opened, so `classroomIds` always holds exactly one entry in that mode.
 */
const formSchema = toTypedSchema(
  z.object({
    teacherId: z.string().min(1, 'Guru wajib dipilih.'),
    subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih.'),
    classroomIds: z.array(z.string()).min(1, 'Pilih minimal satu kelas.'),
    semesterId: z.string().min(1, 'Semester wajib dipilih.'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    teacherId: '',
    subjectId: '',
    classroomIds: [] as string[],
    semesterId: '',
  },
})

function toggleClassroom(
  current: string[],
  classroomId: string,
  checked: boolean,
): string[] {
  if (checked) {
    return current.includes(classroomId) ? current : [...current, classroomId]
  }
  return current.filter((id) => id !== classroomId)
}

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          teacherId: data.teacherId || '',
          subjectId: data.subjectId || '',
          classroomIds: data.classroomId ? [data.classroomId] : [],
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
  classroomIds: string[]
  semesterId: string
}): TeachingAssignmentCreatePayload | TeachingAssignmentUpdatePayload {
  const base = {
    teacherId: values.teacherId,
    subjectId: values.subjectId,
    semesterId: values.semesterId,
  }
  return isEditing.value
    ? { ...base, classroomId: values.classroomIds[0] ?? '' }
    : { ...base, classroomIds: values.classroomIds }
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
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{
            isEditing ? 'Edit Penugasan Mengajar' : 'Tambah Penugasan Mengajar'
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditing
              ? 'Perbarui informasi penugasan mengajar.'
              : 'Masukkan informasi penugasan mengajar yang baru.'
          }}
        </DialogDescription>
      </DialogHeader>

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
            name="classroomIds"
          >
            <FormItem>
              <FormLabel>
                Kelas
                <span class="text-destructive">*</span>
              </FormLabel>

              <!-- Editing targets one existing row, so the class stays single. -->
              <FormControl v-if="isEditing">
                <AppCombobox
                  :model-value="(value as string[])[0] ?? ''"
                  :options="classroomOptions"
                  placeholder="Pilih Kelas"
                  search-placeholder="Cari kelas..."
                  empty-text="Kelas tidak ditemukan."
                  @update:model-value="(val) => handleChange(val ? [val] : [])"
                />
              </FormControl>

              <template v-else>
                <FormControl>
                  <div
                    class="grid grid-cols-2 gap-1.5 rounded-md border p-3 max-h-52 overflow-y-auto"
                  >
                    <label
                      v-for="opt in classroomOptions"
                      :key="opt.value"
                      class="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted/60 cursor-pointer"
                    >
                      <Checkbox
                        :model-value="(value as string[]).includes(opt.value)"
                        @update:model-value="
                          (checked) =>
                            handleChange(
                              toggleClassroom(
                                value as string[],
                                opt.value,
                                checked === true,
                              ),
                            )
                        "
                      />
                      <span>{{ opt.label }}</span>
                    </label>
                    <p
                      v-if="classroomOptions.length === 0"
                      class="col-span-2 text-xs text-muted-foreground"
                    >
                      Belum ada kelas pada tahun ajaran aktif.
                    </p>
                  </div>
                </FormControl>
                <p class="text-xs text-muted-foreground mt-1">
                  Pilih beberapa kelas sekaligus — satu penugasan dibuat per
                  kelas, dan kelas yang sudah ada akan dilewati.
                </p>
              </template>

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

      <DialogFooter
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
      </DialogFooter>
    </DialogContent>
  </Dialog>

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
