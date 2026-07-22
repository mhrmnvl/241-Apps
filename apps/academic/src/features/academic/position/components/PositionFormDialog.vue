<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import api from '@/shared/utils/api'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Loader2 } from 'lucide-vue-next'
import { usePosition } from '../composables/usePosition'
import type { Position, PositionCategoryOption } from '../types'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  open: boolean
  initialData?: Position | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const { isSaving, savePosition } = usePosition()
const categories = ref<PositionCategoryOption[]>([])

onMounted(async () => {
  try {
    const res = await api.get<{ data: PositionCategoryOption[] }>(
      '/position-categories',
      {
        params: { limit: 100 },
      },
    )
    categories.value = res.data.data ?? []
  } catch {
    // non-blocking
  }
})

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama jabatan wajib diisi.'),
    categoryId: z
      .string({
        required_error: 'Kategori jabatan wajib dipilih.',
      })
      .min(1, 'Kategori jabatan wajib dipilih.'),
    isActive: z.boolean().default(true),
  }),
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    categoryId: '',
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
          categoryId: props.initialData.category?.id ?? '',
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
  const result = await savePosition(props.initialData?.id ?? null, {
    name: values.name,
    categoryId: values.categoryId,
    isActive: values.isActive,
  })
  if (result.success) {
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
        <DialogTitle>{{ initialData ? 'Edit' : 'Tambah' }} Jabatan</DialogTitle>
        <DialogDescription>
          {{
            initialData
              ? 'Perbarui data jabatan.'
              : 'Tambahkan jabatan baru ke dalam sistem.'
          }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="position-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Jabatan <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  placeholder="Misal: Kepala Sekolah"
                  :disabled="isSaving"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="categoryId"
          >
            <FormItem>
              <FormLabel
                >Kategori Jabatan
                <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
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
                :disabled="isSaving"
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

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="$emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="position-form"
          :disabled="isSaving"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ initialData ? 'Simpan' : 'Tambah' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
