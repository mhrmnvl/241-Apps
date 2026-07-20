<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useCurriculumSubject } from '../composables/useCurriculumSubject'
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
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
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

const { subjects } = useCurriculumSubject()

const subjectOptions = computed<ComboboxOption[]>(() =>
  subjects.value.map((s) => ({
    value: s.id,
    label: s.code ? `${s.name} (${s.code})` : s.name,
  })),
)

const formSchema = toTypedSchema(
  z.object({
    subjectId: z.string().min(1, 'Mata pelajaran wajib dipilih.'),
    hoursPerWeek: z.coerce
      .number()
      .min(1, 'Minimal 1 jam per minggu.')
      .max(10, 'Maksimal 10 jam per minggu.'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    subjectId: '',
    hoursPerWeek: 2,
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
}): CurriculumSubjectSavePayload {
  return {
    curriculumId: props.curriculumId,
    subjectId: values.subjectId,
    hoursPerWeek: values.hoursPerWeek,
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
            isEditing
              ? 'Edit Mata Pelajaran Kurikulum'
              : 'Tambah Mata Pelajaran Kurikulum'
          }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui informasi mata pelajaran kurikulum.'
              : 'Masukkan informasi mata pelajaran kurikulum yang baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="curriculum-subject-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
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
          form="curriculum-subject-form"
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
