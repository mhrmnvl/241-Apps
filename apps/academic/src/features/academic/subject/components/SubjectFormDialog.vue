<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
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
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { AlertCircle, Info } from 'lucide-vue-next'
import type { Subject, SubjectSavePayload } from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: Subject | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: SubjectSavePayload]
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

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama Mata Pelajaran wajib diisi.'),
    code: z.string().min(1, 'Kode Mata Pelajaran wajib diisi.'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    code: '',
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          name: data.name || '',
          code: data.code || '',
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
  name: string
  code: string
}): SubjectSavePayload {
  return {
    name: values.name,
    code: values.code,
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
          {{ isEditing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru' }}
        </DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="subject-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="code"
          >
            <FormItem>
              <FormLabel
                >Kode Mata Pelajaran
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Contoh: MAT, IPA"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Mata Pelajaran
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Contoh: Matematika"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div
            class="flex gap-2.5 rounded-md border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground"
          >
            <Info class="size-4 shrink-0 mt-px" />
            <p>
              Guru pengampu diatur per kelas dan per semester melalui menu
              <span class="font-medium text-foreground"
                >Pembelajaran &rsaquo; Penugasan Mengajar</span
              >, karena satu mata pelajaran dapat diampu guru berbeda di tiap
              kelas.
            </p>
          </div>

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
          form="subject-form"
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
          Apakah Anda yakin ingin menyimpan perubahan pada mata pelajaran ini?
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
