<script setup lang="ts">
import { ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'
import { timeSlotApi } from '../api/timeSlotApi'
import { WEEK_DAYS } from '../constants'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Switch } from '@/ui/switch'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import type { TimeSlotType } from '../types'

const props = defineProps<{
  open: boolean
  initialData?: TimeSlotType | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const isSubmitting = ref(false)
const isLesson = ref(true)
const days = ref<string[]>([])

const formSchema = toTypedSchema(
  z.object({
    code: z
      .string()
      .min(1, 'Kode wajib diisi.')
      .max(30, 'Kode maksimal 30 karakter.'),
    name: z
      .string()
      .min(1, 'Nama wajib diisi.')
      .max(100, 'Nama maksimal 100 karakter.'),
  }),
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: { code: '', name: '' },
})

function toggleDay(day: string) {
  const index = days.value.indexOf(day)
  if (index >= 0) days.value.splice(index, 1)
  else days.value.push(day)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    if (props.initialData) {
      setValues({
        code: props.initialData.code,
        name: props.initialData.name,
      })
      isLesson.value = props.initialData.isLesson
      days.value = [...(props.initialData.days ?? [])]
    } else {
      resetForm()
      isLesson.value = true
      days.value = []
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    const payload = {
      code: values.code,
      name: values.name,
      isLesson: isLesson.value,
      days: days.value,
    }
    if (props.initialData) {
      await timeSlotApi.updateTimeSlotType(props.initialData.id, payload)
      toast.success('Tipe jam berhasil diperbarui')
    } else {
      await timeSlotApi.createTimeSlotType(payload)
      toast.success('Tipe jam berhasil ditambahkan')
    }
    emit('success')
    emit('update:open', false)
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan tipe jam'))
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <Sheet
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>{{ initialData ? 'Edit' : 'Tambah' }} Tipe Jam</SheetTitle>
        <SheetDescription>
          {{
            initialData
              ? 'Perbarui data tipe jam.'
              : 'Tambahkan tipe jam baru ke dalam sistem.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="time-slot-type-form"
          class="space-y-5 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="code"
          >
            <FormItem>
              <FormLabel
                >Kode <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="cth: CEREMONY"
                  :disabled="isSubmitting || !!initialData"
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
                >Nama <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="cth: Upacara"
                  :disabled="isSubmitting"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Jenis</label>
            <div class="flex items-center gap-3 rounded-lg border p-3">
              <Switch
                :model-value="isLesson"
                :disabled="isSubmitting"
                @update:model-value="(v) => (isLesson = v)"
              />
              <div class="space-y-0.5">
                <p class="text-sm font-medium">
                  {{ isLesson ? 'Pelajaran' : 'Khusus' }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{
                    isLesson
                      ? 'Slot biasa yang bisa diisi mata pelajaran.'
                      : 'Kegiatan non-pelajaran (upacara, istirahat, dll).'
                  }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium leading-none">Hari Berlaku</label>
            <div class="flex flex-wrap gap-2">
              <Button
                v-for="d in WEEK_DAYS"
                :key="d.value"
                type="button"
                size="sm"
                :variant="days.includes(d.value) ? 'default' : 'outline'"
                :disabled="isSubmitting"
                @click="toggleDay(d.value)"
              >
                {{ d.short }}
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{
                days.length === 0
                  ? 'Tidak dipilih = berlaku setiap hari.'
                  : 'Hanya berlaku pada hari yang dipilih.'
              }}
            </p>
          </div>
        </form>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSubmitting"
          @click="$emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="time-slot-type-form"
          :disabled="isSubmitting"
        >
          <Loader2
            v-if="isSubmitting"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ initialData ? 'Simpan' : 'Tambah' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
