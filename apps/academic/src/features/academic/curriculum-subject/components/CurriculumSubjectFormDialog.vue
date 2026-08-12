<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
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
import { Input } from '@/ui/input'
import { AlertCircle } from 'lucide-vue-next'
import type { CurriculumSubject, CurriculumSubjectSavePayload } from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  curriculumId: string
  editData?: CurriculumSubject | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: CurriculumSubjectSavePayload]
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

/** Matches the backend default, so a new row opens on the same number. */
const DEFAULT_PASSING_SCORE = 75

const formSchema = toTypedSchema(
  z.object({
    subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih.'),
    hoursPerWeek: z.coerce
      .number()
      .min(1, 'Minimal 1 jam per minggu.')
      .max(10, 'Maksimal 10 jam per minggu.'),
    passingScore: z.coerce
      .number()
      .int('KKM harus bilangan bulat.')
      .min(0, 'KKM minimal 0.')
      .max(100, 'KKM maksimal 100.'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    subjectId: '',
    hoursPerWeek: 2,
    passingScore: DEFAULT_PASSING_SCORE,
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          subjectId: data.subjectId || '',
          hoursPerWeek: data.hoursPerWeek ?? 2,
          passingScore: data.passingScore ?? DEFAULT_PASSING_SCORE,
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
  subjectId: string
  hoursPerWeek: number
  passingScore: number
}): CurriculumSubjectSavePayload {
  return {
    curriculumId: props.curriculumId,
    subjectId: values.subjectId,
    hoursPerWeek: values.hoursPerWeek,
    passingScore: values.passingScore,
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
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{
            isEditing
              ? 'Edit Mata Pelajaran Kurikulum'
              : 'Tambah Mata Pelajaran Kurikulum'
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditing
              ? 'Perbarui informasi mata pelajaran kurikulum.'
              : 'Masukkan informasi mata pelajaran kurikulum yang baru.'
          }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="curriculum-subject-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField name="subjectId">
            <FormItem>
              <FormLabel> Mata Pelajaran </FormLabel>
              <FormControl>
                <Input
                  :model-value="
                    editData?.subject
                      ? editData.subject.code
                        ? `${editData.subject.name} (${editData.subject.code})`
                        : editData.subject.name
                      : ''
                  "
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="hoursPerWeek"
          >
            <FormItem>
              <FormLabel>
                Jam per Minggu
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  :model-value="value"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Masukkan jumlah jam per minggu"
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="passingScore"
          >
            <FormItem>
              <FormLabel>
                KKM
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  :model-value="value"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="75"
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <p class="text-xs text-muted-foreground">
                Batas nilai tuntas untuk mata pelajaran ini di kurikulum ini.
                Menentukan juga predikat A/B/C/D di rapor — predikat D selalu di
                bawah angka ini. Guru dapat menaikkan atau menurunkannya untuk
                kelas yang diampunya lewat Penugasan Mengajar.
              </p>
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
          form="curriculum-subject-form"
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
          Apakah Anda yakin ingin menyimpan perubahan pada mata pelajaran
          kurikulum ini?
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
