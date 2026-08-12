<script setup lang="ts">
import { DatePicker } from '@/ui'
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
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, watch } from 'vue'
import * as z from 'zod'
import { components, DRIVER_LABEL } from '../../component'
import {
  isSaving,
  salaryAssignmentService,
} from '../services/salaryAssignmentService'

const props = defineProps<{ open: boolean; userId: string | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; success: [] }>()

const formSchema = toTypedSchema(
  z.object({
    componentId: z.string().uuid('Pilih komponen gaji.'),
    value: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Isi angka tanpa titik ribuan.'),
    effectiveFrom: z.string().min(10, 'Pilih tanggal berlaku.'),
  }),
)

const { handleSubmit, resetForm, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    componentId: '',
    value: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
  },
})

const activeComponents = computed(() =>
  components.value.filter((component) => component.isActive),
)

const selected = computed(() =>
  activeComponents.value.find(
    (component) => component.id === values.componentId,
  ),
)

/** A component with a driver takes a rate per unit; the rest take a nominal. */
const isDriven = computed(() => Boolean(selected.value?.driver))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

const onSubmit = handleSubmit(async (form) => {
  if (!props.userId) return

  const ok = await salaryAssignmentService.save({
    userId: props.userId,
    componentId: form.componentId,
    amount: isDriven.value ? null : form.value,
    rate: isDriven.value ? form.value : null,
    effectiveFrom: form.effectiveFrom,
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
        <DialogTitle>Tetapkan Gaji Pegawai</DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <form
        class="flex flex-col flex-1 min-h-0"
        @submit="onSubmit"
      >
        <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <FormField
            v-slot="{ componentField }"
            name="componentId"
          >
            <FormItem>
              <FormLabel>
                Komponen Gaji <span class="text-destructive">*</span>
              </FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih komponen gaji" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="component in activeComponents"
                    :key="component.id"
                    :value="component.id"
                  >
                    {{ component.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="value"
          >
            <FormItem>
              <FormLabel>
                {{ isDriven ? 'Tarif per Satuan (Rp)' : 'Nominal (Rp)' }}
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  inputmode="numeric"
                  placeholder="3500000"
                />
              </FormControl>
              <FormDescription v-if="isDriven && selected?.driver">
                Dikalikan {{ DRIVER_LABEL[selected.driver].toLowerCase() }} pada
                bulan yang dihitung.
              </FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="effectiveFrom"
          >
            <FormItem>
              <FormLabel>
                Berlaku Mulai <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  :model-value="value"
                  placeholder="Pilih tanggal berlaku"
                  @update:model-value="handleChange"
                />
              </FormControl>
              <FormMessage />
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
            :disabled="isSaving || !userId"
          >
            Simpan
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
