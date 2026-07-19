<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Loader2 } from 'lucide-vue-next'
import { useOccupationForm } from '../composables/useOccupationForm'
import type { Occupation } from '../types'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  initialData?: Occupation | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const { isSubmitting, createOccupation, updateOccupation } = useOccupationForm()

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama pekerjaan wajib diisi.'),
    isActive: z.boolean().default(true),
  }),
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    isActive: true,
  },
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        setValues({
          name: props.initialData.name,
          isActive: props.initialData.isActive,
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (values) => {
  const success = props.initialData
    ? await updateOccupation(props.initialData.id, values)
    : await createOccupation(values)

  if (success) {
    emit('success')
    emit('update:open', false)
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
        <SheetTitle>{{ initialData ? 'Edit' : 'Tambah' }} Pekerjaan</SheetTitle>
        <SheetDescription>
          {{
            initialData
              ? 'Perbarui data pekerjaan.'
              : 'Tambahkan pekerjaan baru ke dalam sistem.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="occupation-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Pekerjaan
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Misal: Pegawai Negeri Sipil"
                  :disabled="isSubmitting"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="isActive"
          >
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                :model-value="String(value)"
                :disabled="isSubmitting"
                @update:model-value="handleChange($event === 'true')"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true"> Aktif </SelectItem>
                  <SelectItem value="false"> Tidak Aktif </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
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
          form="occupation-form"
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
