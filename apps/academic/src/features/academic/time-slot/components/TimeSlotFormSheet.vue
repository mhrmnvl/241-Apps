<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { TimeSlotType } from '../types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { AlertCircle } from 'lucide-vue-next'
import type { TimeSlot, TimeSlotSavePayload } from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: TimeSlot | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: TimeSlotSavePayload]
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

function isoToHHMM(isoOrTime: string | undefined): string {
  if (!isoOrTime) return ''
  try {
    const d = new Date(isoOrTime)
    if (!isNaN(d.getTime())) return d.toISOString().substring(11, 16)
  } catch {
    void 0
  }
  return isoOrTime.substring(0, 5)
}

const TIME_SLOT_TYPES = ['LESSON', 'BREAK', 'CEREMONY', 'TAHFIDZ'] as const

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama Jam wajib diisi.'),
    startTime: z.string().min(1, 'Waktu Mulai wajib diisi.'),
    endTime: z.string().min(1, 'Waktu Selesai wajib diisi.'),
    order: z.number().min(1, 'Urutan minimal 1.'),
    type: z.enum(TIME_SLOT_TYPES).default('LESSON'),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    startTime: '07:00',
    endTime: '07:30',
    order: 1,
    type: 'LESSON' as TimeSlotType,
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
          startTime: isoToHHMM(data.startTime),
          endTime: isoToHHMM(data.endTime),
          order: data.order || 1,
          type: data.type || 'LESSON',
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)

const onSubmit = handleSubmit((values) => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', { ...values })
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  void handleSubmit((values) => {
    emit('save', { ...values })
  })()
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEditing ? 'Edit Jam Pelajaran' : 'Tambah Jam Pelajaran Baru' }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui data jam pelajaran.'
              : 'Tambahkan jam pelajaran baru ke dalam sistem.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="time-slot-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Jam <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="cth: Jam ke-1"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="order"
          >
            <FormItem>
              <FormLabel>Urutan Jam</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid grid-cols-2 gap-4">
            <FormField
              v-slot="{ componentField }"
              name="startTime"
            >
              <FormItem>
                <FormLabel
                  >Waktu Mulai
                  <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    type="time"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="endTime"
            >
              <FormItem>
                <FormLabel
                  >Waktu Selesai
                  <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    type="time"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <FormField
            v-slot="{ value, handleChange }"
            name="type"
          >
            <FormItem>
              <FormLabel>Tipe Jam Pelajaran</FormLabel>
              <Select
                :model-value="value"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih tipe jam..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CEREMONY">Upacara/Ba'iat</SelectItem>
                  <SelectItem value="LESSON">Pelajaran</SelectItem>
                  <SelectItem value="BREAK">Istirahat</SelectItem>
                  <SelectItem value="TAHFIDZ">Tahfidz</SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground mt-1">
                Kegiatan khusus tidak akan bisa dijadwalkan dengan mata
                pelajaran biasa.
              </p>
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
          form="time-slot-form"
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
          Apakah Anda yakin ingin menyimpan perubahan pada jam pelajaran ini?
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
