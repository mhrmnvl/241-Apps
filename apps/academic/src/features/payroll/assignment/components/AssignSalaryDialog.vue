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
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Tetapkan Gaji</DialogTitle>
        <DialogDescription>
          Nilai lama tidak ditimpa — ditutup sehari sebelum tanggal berlaku ini,
          sehingga slip gaji bulan sebelumnya tetap bisa dihitung ulang apa
          adanya.
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="componentId"
        >
          <FormItem>
            <FormLabel>Komponen</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
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
              {{ isDriven ? 'Tarif per satuan (Rp)' : 'Nominal (Rp)' }}
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
          v-slot="{ componentField }"
          name="effectiveFrom"
        >
          <FormItem>
            <FormLabel>Berlaku mulai</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="date"
              />
            </FormControl>
            <FormDescription>
              Perhitungan memakai nilai yang berlaku pada hari terakhir bulan
              tersebut.
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
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
            >Simpan</Button
          >
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
