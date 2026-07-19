<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Button,
  Input,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui'
import { Switch } from '@/ui/switch'
import type { InventoryReferenceItem } from '../types'

const props = defineProps<{
  open: boolean
  item: InventoryReferenceItem | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: Omit<InventoryReferenceItem, 'id'>): void
}>()

const isEdit = computed(() => !!props.item)

const formSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Kode wajib diisi'),
    name: z.string().min(1, 'Nama status wajib diisi'),
    allowTransactions: z.boolean().default(true),
  }),
)

interface StatusFormValues {
  code: string
  name: string
  allowTransactions: boolean
}

const { handleSubmit, resetForm } = useForm<StatusFormValues>({
  validationSchema: formSchema,
})

watch(
  () => [props.open, props.item],
  () => {
    if (props.open) {
      if (props.item) {
        resetForm({
          values: {
            code: props.item.code || '',
            name: props.item.name || '',
            allowTransactions: props.item.allowTransactions ?? true,
          },
        })
      } else {
        resetForm({
          values: {
            code: '',
            name: '',
            allowTransactions: true,
          },
        })
      }
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('save', values)
})
</script>

<template>
  <Sheet
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <SheetContent class="flex flex-col h-full w-[400px] sm:w-[540px]">
      <SheetHeader class="border-b pb-4 px-1">
        <SheetTitle class="text-xl font-semibold tracking-tight">
          {{ isEdit ? 'Ubah Status Aset' : 'Tambah Status Aset' }}
        </SheetTitle>
      </SheetHeader>

      <form
        class="flex flex-col flex-1 min-h-0"
        @submit="onSubmit"
      >
        <ScrollArea class="flex-1 min-h-0 px-1 py-4">
          <div class="space-y-4">
            <!-- Field: Code -->
            <FormField
              v-slot="{ componentField }"
              name="code"
            >
              <FormItem>
                <FormLabel class="text-sm font-medium">Kode Status</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Contoh: STATUS-TERSEDIA"
                    :disabled="isSaving || isEdit"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Field: Name -->
            <FormField
              v-slot="{ componentField }"
              name="name"
            >
              <FormItem>
                <FormLabel class="text-sm font-medium">Nama Status</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Contoh: Tersedia / Dipinjam"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Field: allowTransactions -->
            <FormField
              v-slot="{ value, handleChange }"
              name="allowTransactions"
            >
              <FormItem
                class="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div class="space-y-0.5">
                  <FormLabel class="text-sm font-medium"
                    >Bisa Ditransaksikan / Dipinjam</FormLabel
                  >
                  <p class="text-xs text-muted-foreground">
                    Aktifkan jika aset dengan status ini diperbolehkan untuk
                    dipinjam.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    :checked="value"
                    :disabled="isSaving"
                    @update:checked="handleChange"
                  />
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </ScrollArea>

        <SheetFooter class="border-t pt-4 px-1 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="emit('update:open', false)"
          >
            Batal
          </Button>
          <Button
            type="submit"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
