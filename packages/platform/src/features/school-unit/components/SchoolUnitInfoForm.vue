<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { statusOptions } from '../constants'
import { schoolUnitTypeApi } from '@/features/platform/school-unit-type'
import type { SchoolUnitProfile } from '../types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'

const props = defineProps<{
  draftSchoolUnit: SchoolUnitProfile
  formError: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: []
  cancel: []
  'update:draftSchoolUnit': [value: SchoolUnitProfile]
}>()

const typeOptions = ref<{ value: string; label: string }[]>([])

onMounted(async () => {
  try {
    const res = await schoolUnitTypeApi.getSchoolUnitTypes({ limit: 100 })
    const activeTypes = res.data.data?.filter((t) => t.isActive) ?? []
    typeOptions.value = activeTypes.map((t) => ({
      value: t.id,
      label: t.name,
    }))
  } catch (error) {
    console.error('Gagal memuat tipe unit sekolah:', error)
  }
})

/**
 * A coordinate is optional, and an emptied field means "no pin" rather than 0 —
 * which is a real place in the Atlantic. The preprocess turns the input's empty
 * string into null before the number rules ever see it.
 */
const coordinate = (label: string, bound: number) =>
  z.preprocess(
    (value) =>
      value === '' || value === null || value === undefined
        ? null
        : Number(value),
    z
      .number({ invalid_type_error: `${label} harus berupa angka.` })
      .min(-bound, `${label} minimal -${bound}.`)
      .max(bound, `${label} maksimal ${bound}.`)
      .nullable(),
  )

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama lembaga wajib diisi.'),
    surname: z.string().min(1, 'Nama singkat wajib diisi.'),
    nsm: z.string().min(1, 'NSM wajib diisi.'),
    npsn: z.string().min(1, 'NPSN wajib diisi.'),
    status: z.enum(['PUBLIC', 'PRIVATE'], {
      required_error: 'Status wajib dipilih.',
    }),
    typeId: z.string().min(1, 'Tipe wajib dipilih.'),
    npwp: z.string().min(1, 'NPWP wajib diisi.'),
    phone: z.string().min(1, 'Telepon wajib diisi.'),
    email: z
      .string()
      .email('Format email tidak valid.')
      .min(1, 'Email wajib diisi.'),
    website: z.string().min(1, 'Website wajib diisi.'),
    latitude: coordinate('Latitude', 90),
    longitude: coordinate('Longitude', 180),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    surname: '',
    nsm: '',
    npsn: '',
    status: undefined,
    typeId: undefined,
    npwp: '',
    phone: '',
    email: '',
    website: '',
    latitude: null,
    longitude: null,
  },
})

watch(
  () => props.draftSchoolUnit,
  (newVal) => {
    form.resetForm({
      values: {
        name: newVal.name ?? '',
        surname: newVal.surname ?? '',
        nsm: newVal.nsm ?? '',
        npsn: newVal.npsn ?? '',
        status: newVal.status ?? undefined,
        typeId: newVal.typeId ?? undefined,
        npwp: newVal.npwp ?? '',
        phone: newVal.phone ?? '',
        email: newVal.email ?? '',
        website: newVal.website ?? '',
        latitude: newVal.latitude ?? null,
        longitude: newVal.longitude ?? null,
      },
    })
  },
  { immediate: true, deep: true },
)

const onSave = form.handleSubmit((values) => {
  emit('update:draftSchoolUnit', values)
  emit('save')
})
</script>

<template>
  <div>
    <div class="px-6 pt-3 pb-6">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField
          v-slot="{ componentField }"
          name="name"
        >
          <FormItem class="content-start">
            <FormLabel
              >Nama Lembaga <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan nama Lembaga"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="surname"
        >
          <FormItem class="content-start">
            <FormLabel
              >Nama Singkat <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan nama singkat"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="nsm"
        >
          <FormItem class="content-start">
            <FormLabel>NSM <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan NSM"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="npsn"
        >
          <FormItem class="content-start">
            <FormLabel>NPSN <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan NPSN"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="status"
        >
          <FormItem class="content-start">
            <FormLabel
              >Status <span class="text-destructive">*</span></FormLabel
            >
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="typeId"
        >
          <FormItem class="content-start">
            <FormLabel>Tipe <span class="text-destructive">*</span></FormLabel>
            <Select
              v-bind="componentField"
              :disabled="Boolean(props.draftSchoolUnit.id)"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih tipe unit sekolah" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="npwp"
        >
          <FormItem class="content-start">
            <FormLabel>NPWP <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan NPWP"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="phone"
        >
          <FormItem class="content-start">
            <FormLabel
              >Telepon <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan nomor telepon"
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
          <FormItem class="content-start">
            <FormLabel>Email <span class="text-destructive">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan email"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="website"
        >
          <FormItem class="content-start">
            <FormLabel
              >Website <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="https://contoh.sch.id"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="latitude"
        >
          <FormItem class="content-start">
            <FormLabel>Latitude</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputmode="decimal"
                placeholder="-6.914744"
                v-bind="componentField"
              />
            </FormControl>
            <p class="text-xs text-muted-foreground">
              Opsional. Titik ini yang ditampilkan pada peta di profil sekolah.
            </p>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="longitude"
        >
          <FormItem class="content-start">
            <FormLabel>Longitude</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputmode="decimal"
                placeholder="107.609810"
                v-bind="componentField"
              />
            </FormControl>
            <p class="text-xs text-muted-foreground">
              Kosongkan keduanya untuk menghapus titik lokasi.
            </p>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <p
        v-if="formError"
        class="text-sm font-medium text-destructive mt-4"
      >
        {{ formError }}
      </p>
    </div>

    <div
      class="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end gap-2"
    >
      <Button
        type="button"
        variant="outline"
        @click="emit('cancel')"
      >
        Batal
      </Button>
      <Button
        type="button"
        variant="default"
        :disabled="isSaving"
        @click="onSave"
      >
        <div
          v-if="isSaving"
          class="size-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
        />
        {{ isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan' }}
      </Button>
    </div>
  </div>
</template>
