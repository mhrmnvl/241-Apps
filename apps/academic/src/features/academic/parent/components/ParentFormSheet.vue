<script setup lang="ts">
import { computed, toRefs, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
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
import {
  FormControl,
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
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { AlertCircle } from 'lucide-vue-next'
import type { Parent, ParentSavePayload, IncomeRange } from '../types'
import type { Occupation } from '@/features/academic/occupation'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: Parent | null
  occupations: Occupation[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: ParentSavePayload]
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

const occupationOptions = computed<ComboboxOption[]>(() =>
  props.occupations.map((o) => ({
    value: o.id,
    label: o.name,
  })),
)

const incomeOptions = [
  { value: 'BELOW_500K', label: '< Rp 500.000' },
  { value: 'BETWEEN_500K_1M', label: 'Rp 500.000 - 1.000.000' },
  { value: 'BETWEEN_1M_2M', label: 'Rp 1.000.000 - 2.000.000' },
  { value: 'BETWEEN_2M_3M', label: 'Rp 2.000.000 - 3.000.000' },
  { value: 'ABOVE_3M', label: '> Rp 3.000.000' },
]

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Nama wajib diisi.')
      .max(100, 'Nama maksimal 100 karakter.'),
    nik: z.string().length(16, 'NIK harus tepat 16 karakter.'),
    birthPlace: z
      .string()
      .min(1, 'Tempat lahir wajib diisi.')
      .max(100, 'Tempat lahir maksimal 100 karakter.'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
    email: z
      .string()
      .email('Format email tidak valid.')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(15, 'No. telepon maksimal 15 karakter.')
      .optional()
      .or(z.literal('')),
    occupationId: z.string().min(1, 'Pekerjaan wajib dipilih.'),
    income: z
      .enum([
        'BELOW_500K',
        'BETWEEN_500K_1M',
        'BETWEEN_1M_2M',
        'BETWEEN_2M_3M',
        'ABOVE_3M',
      ])
      .optional()
      .or(z.literal('')),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    email: '',
    phone: '',
    occupationId: '',
    income: '',
  },
})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    if (isOpen) {
      const data = editData?.value
      if (data) {
        setValues({
          name: data.name ?? '',
          nik: data.nik ?? '',
          birthPlace: data.birthPlace ?? '',
          birthDate: data.birthDate ? data.birthDate.slice(0, 10) : '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          occupationId: data.occupationId ?? '',
          income: data.income ?? '',
        })
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)

const showConfirmAlert = ref(false)

function buildPayload(vals: {
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  occupationId: string
  income?: string
}): ParentSavePayload {
  return {
    name: vals.name,
    nik: vals.nik,
    birthPlace: vals.birthPlace,
    birthDate: new Date(vals.birthDate).toISOString(),
    occupationId: vals.occupationId,
    ...(vals.email ? { email: vals.email } : {}),
    ...(vals.phone ? { phone: vals.phone } : {}),
    ...(vals.income ? { income: vals.income as IncomeRange } : {}),
  }
}

const onSubmit = handleSubmit((values) => {
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    emit('save', buildPayload(values))
  }
})

function confirmSave() {
  showConfirmAlert.value = false
  void handleSubmit((values) => {
    emit('save', buildPayload(values))
  })()
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEditing ? 'Edit Data Orang Tua' : 'Tambah Data Orang Tua' }}
        </SheetTitle>
        <SheetDescription>
          {{
            isEditing
              ? 'Perbarui informasi data orang tua siswa.'
              : 'Masukkan informasi data orang tua baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="parent-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel>
                Nama Lengkap
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Masukkan nama lengkap..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="nik"
          >
            <FormItem>
              <FormLabel>
                NIK (Nomor Induk Kependudukan)
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Masukkan NIK 16 digit..."
                  maxlength="16"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="birthPlace"
          >
            <FormItem>
              <FormLabel>
                Tempat Lahir
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Masukkan tempat lahir..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="birthDate"
          >
            <FormItem>
              <FormLabel>
                Tanggal Lahir
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormLabel>
                Email
                <span class="text-muted-foreground font-normal"
                  >(Opsional)</span
                >
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  v-bind="componentField"
                  placeholder="contoh@email.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="phone"
          >
            <FormItem>
              <FormLabel>
                Nomor Telepon
                <span class="text-muted-foreground font-normal"
                  >(Opsional)</span
                >
              </FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="08xxxxxxxxxx"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="occupationId"
          >
            <FormItem>
              <FormLabel>
                Pekerjaan
                <span class="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <AppCombobox
                  :model-value="value"
                  :options="occupationOptions"
                  placeholder="Pilih Pekerjaan"
                  search-placeholder="Cari pekerjaan..."
                  empty-text="Pekerjaan tidak ditemukan."
                  @update:model-value="(val) => handleChange(val)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="income"
          >
            <FormItem>
              <FormLabel>
                Rentang Penghasilan
                <span class="text-muted-foreground font-normal"
                  >(Opsional)</span
                >
              </FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Rentang Penghasilan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    v-for="opt in incomeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
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
          form="parent-form"
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
          Apakah Anda yakin ingin menyimpan perubahan pada data orang tua ini?
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
