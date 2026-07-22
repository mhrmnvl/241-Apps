<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { Button } from '@/ui/button'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Loader2 } from 'lucide-vue-next'
import { usePositionCategoryForm } from '../composables/usePositionCategoryForm'
import type { PositionCategory } from '../types'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  initialData?: PositionCategory | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const { isSubmitting, createPositionCategory, updatePositionCategory } =
  usePositionCategoryForm()

const formSchema = toTypedSchema(
  z.object({
    code: z
      .string()
      .min(1, 'Kode kategori wajib diisi.')
      .max(30, 'Kode kategori maksimal 30 karakter.'),
    name: z
      .string()
      .min(1, 'Nama kategori wajib diisi.')
      .max(100, 'Nama kategori maksimal 100 karakter.'),
  }),
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    code: '',
    name: '',
  },
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        setValues({
          code: props.initialData.code,
          name: props.initialData.name,
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
    ? await updatePositionCategory(props.initialData.id, { name: values.name })
    : await createPositionCategory(values)

  if (success) {
    emit('success')
    emit('update:open', false)
  }
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle
          >{{ initialData ? 'Edit' : 'Tambah' }} Kategori Jabatan</DialogTitle
        >
        <DialogDescription>
          {{
            initialData
              ? 'Perbarui data kategori jabatan.'
              : 'Tambahkan kategori jabatan baru ke dalam sistem.'
          }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="position-category-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="code"
          >
            <FormItem>
              <FormLabel
                >Kode Kategori
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Misal: MANAGEMENT"
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
                >Nama Kategori
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Misal: Management"
                  :disabled="isSubmitting"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </ScrollArea>

      <DialogFooter
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
          form="position-category-form"
          :disabled="isSubmitting"
        >
          <Loader2
            v-if="isSubmitting"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ initialData ? 'Simpan' : 'Tambah' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
