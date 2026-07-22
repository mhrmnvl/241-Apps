<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import {
  Button,
  Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui'
import { Switch } from '@/ui/switch'
import type { InventoryReferenceItem, InventoryStatusKey } from '../types'

const props = defineProps<{
  open: boolean
  item: InventoryReferenceItem | null
  isSaving: boolean
  existingStatuses: InventoryReferenceItem[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: Omit<InventoryReferenceItem, 'id'>): void
}>()

const isEdit = computed(() => !!props.item)

const SYSTEM_KEY_OPTIONS: { value: InventoryStatusKey; label: string }[] = [
  { value: 'AVAILABLE', label: 'Tersedia (unit siap dipinjam)' },
  { value: 'LOAN_PENDING', label: 'Menunggu Persetujuan Pinjam' },
  { value: 'LOAN_APPROVED', label: 'Pinjam Disetujui' },
  { value: 'LOANED', label: 'Sedang Dipinjam' },
  { value: 'LOAN_RETURNED', label: 'Baru Dikembalikan' },
  { value: 'LOAN_REJECTED', label: 'Pinjam Ditolak' },
]
const NONE_VALUE = 'NONE'

const takenSystemKeys = computed(() => {
  const taken = new Map<InventoryStatusKey, string>()
  for (const s of props.existingStatuses) {
    if (s.systemKey && s.id !== props.item?.id) {
      taken.set(s.systemKey, s.name)
    }
  }
  return taken
})

const formSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Kode wajib diisi'),
    name: z.string().min(1, 'Nama status wajib diisi'),
    allowTransactions: z.boolean().default(true),
    systemKey: z.string().default(NONE_VALUE),
  }),
)

interface StatusFormValues {
  code: string
  name: string
  allowTransactions: boolean
  systemKey: string
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
            systemKey: props.item.systemKey ?? NONE_VALUE,
          },
        })
      } else {
        resetForm({
          values: {
            code: '',
            name: '',
            allowTransactions: true,
            systemKey: NONE_VALUE,
          },
        })
      }
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('save', {
    ...values,
    systemKey:
      values.systemKey === NONE_VALUE
        ? null
        : (values.systemKey as InventoryStatusKey),
  })
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle class="text-xl font-semibold tracking-tight">
          {{ isEdit ? 'Ubah Status Aset' : 'Tambah Status Aset' }}
        </DialogTitle>
      </DialogHeader>

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

            <!-- Field: systemKey -->
            <FormField
              v-slot="{ value, handleChange }"
              name="systemKey"
            >
              <FormItem>
                <FormLabel class="text-sm font-medium"
                  >Peran dalam Alur Pinjam</FormLabel
                >
                <Select
                  :model-value="value"
                  :disabled="isSaving"
                  @update:model-value="handleChange"
                >
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Pilih peran (opsional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem :value="NONE_VALUE"
                      >Tidak ada (status kustom)</SelectItem
                    >
                    <SelectItem
                      v-for="opt in SYSTEM_KEY_OPTIONS"
                      :key="opt.value"
                      :value="opt.value"
                      :disabled="takenSystemKeys.has(opt.value)"
                    >
                      {{ opt.label }}
                      {{
                        takenSystemKeys.has(opt.value)
                          ? `(dipakai oleh "${takenSystemKeys.get(opt.value)}")`
                          : ''
                      }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-xs text-muted-foreground">
                  Menandai status ini sebagai bagian dari alur sistem
                  (pinjam/kembalikan/setujui). Setiap peran hanya boleh dipakai
                  oleh satu status.
                </p>
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
                    :model-value="value"
                    :disabled="isSaving"
                    @update:model-value="handleChange"
                  />
                </FormControl>
              </FormItem>
            </FormField>
          </div>
        </ScrollArea>

        <DialogFooter
          class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
        >
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
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
