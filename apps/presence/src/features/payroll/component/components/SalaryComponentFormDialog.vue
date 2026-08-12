<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Switch } from '@/ui/switch'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import * as z from 'zod'
import {
  isSaving,
  salaryComponentService,
} from '../services/salaryComponentService'
import { COMPONENT_TYPE_LABEL, DRIVABLE_TYPES, DRIVER_LABEL } from '../types'
import type { SalaryComponent, SalaryComponentType } from '../types'

const props = defineProps<{
  open: boolean
  initialData: SalaryComponent | null
}>()
const emit = defineEmits<{ 'update:open': [value: boolean]; success: [] }>()

const isEdit = computed(() => Boolean(props.initialData))

/**
 * Bespoke rather than a `@241/master-data` config, following the `position` and
 * `leave-type` precedent: the engine expresses only text and boolean fields,
 * and this entity needs two enums with a conditional dependency between them.
 */
const formSchema = toTypedSchema(
  z
    .object({
      code: z
        .string()
        .min(2, 'Kode wajib diisi.')
        .regex(/^[A-Z][A-Z0-9_]*$/, 'Gunakan HURUF_BESAR_DAN_GARIS_BAWAH.'),
      name: z.string().min(2, 'Nama wajib diisi.'),
      type: z.enum(['BASE', 'ALLOWANCE', 'ATTENDANCE_DRIVEN', 'DEDUCTION']),
      driver: z
        .enum([
          'PRESENT_DAYS',
          'ABSENT_DAYS',
          'LATE_COUNT',
          'LATE_MINUTES',
          'EARLY_LEAVE_COUNT',
          'LEAVE_DAYS',
          'OFFICIAL_DUTY_DAYS',
        ])
        .optional(),
      isActive: z.boolean().default(true),
    })
    // Mirrors the API rule: a driven component with no driver has no count to
    // multiply and would silently pay zero.
    .refine((value) => value.type !== 'ATTENDANCE_DRIVEN' || value.driver, {
      message: 'Komponen berbasis kehadiran harus punya dasar perhitungan.',
      path: ['driver'],
    }),
)

const { handleSubmit, setValues, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    code: '',
    name: '',
    type: 'ALLOWANCE' as SalaryComponentType,
    driver: undefined,
    isActive: true,
  },
})

/** A potongan may be counted per day; a tunjangan tetap may not. */
const canBeDriven = computed(
  () => values.type !== undefined && DRIVABLE_TYPES.includes(values.type),
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    if (props.initialData) {
      setValues({
        code: props.initialData.code,
        name: props.initialData.name,
        type: props.initialData.type,
        driver: props.initialData.driver ?? undefined,
        isActive: props.initialData.isActive,
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit(async (form) => {
  const ok = await salaryComponentService.save(props.initialData?.id ?? null, {
    code: form.code,
    name: form.name,
    type: form.type,
    driver: DRIVABLE_TYPES.includes(form.type) ? (form.driver ?? null) : null,
    isActive: form.isActive,
  })

  if (ok) {
    emit('success')
    emit('update:open', false)
  }
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{ isEdit ? 'Ubah Komponen Gaji' : 'Tambah Komponen Gaji' }}
        </DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <form
        class="flex flex-col flex-1 min-h-0"
        @submit="onSubmit"
      >
        <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <FormField
            v-slot="{ componentField }"
            name="code"
          >
            <FormItem>
              <FormLabel>
                Kode <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  :disabled="isEdit"
                  placeholder="TUNJ_TRANSPORT"
                />
              </FormControl>
              <FormDescription v-if="isEdit">
                Kode tidak dapat diubah setelah dibuat.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>
                Nama <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Tunjangan Transport"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="type"
          >
            <FormItem>
              <FormLabel>
                Jenis <span class="text-destructive">*</span>
              </FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih jenis komponen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="(label, value) in COMPONENT_TYPE_LABEL"
                    :key="value"
                    :value="value"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-if="canBeDriven"
            v-slot="{ componentField }"
            name="driver"
          >
            <FormItem>
              <FormLabel>Dasar Perhitungan</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih dasar perhitungan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="(label, value) in DRIVER_LABEL"
                    :key="value"
                    :value="value"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Nilainya nanti diisi sebagai tarif per satuan, bukan nominal
                tetap.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-if="isEdit"
            v-slot="{ value, handleChange }"
            name="isActive"
          >
            <FormItem
              class="flex items-center justify-between rounded-lg border p-3 cursor-pointer select-none"
              @click="handleChange(!value)"
            >
              <FormLabel class="cursor-pointer font-medium">Aktif</FormLabel>
              <FormControl>
                <Switch
                  :model-value="value"
                  @update:model-value="handleChange"
                />
              </FormControl>
            </FormItem>
          </FormField>
        </div>

        <DialogFooter
          class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0"
        >
          <Button
            type="button"
            variant="outline"
            @click="emit('update:open', false)"
          >
            Batal
          </Button>
          <Button
            type="submit"
            :disabled="isSaving"
          >
            Simpan
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
