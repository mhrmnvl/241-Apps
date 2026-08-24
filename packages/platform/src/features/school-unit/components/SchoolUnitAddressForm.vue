<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { SchoolUnitAddress } from '../types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  draftAddress: SchoolUnitAddress
  formError: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: []
  cancel: []
  'update:draftAddress': [value: SchoolUnitAddress]
}>()

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
  z
    .object({
      street: z.string().min(1, 'Alamat wajib diisi.'),
      rt: z.string().max(5, 'RT maksimal 5 karakter.').optional().default(''),
      rw: z.string().max(5, 'RW maksimal 5 karakter.').optional().default(''),
      village: z.string().min(1, 'Kelurahan / Desa wajib diisi.'),
      district: z.string().min(1, 'Kecamatan wajib diisi.'),
      city: z.string().min(1, 'Kota / Kabupaten wajib diisi.'),
      province: z.string().min(1, 'Provinsi wajib diisi.'),
      country: z.string().min(1, 'Negara wajib diisi.'),
      postalCode: z.string().min(1, 'Kode Pos wajib diisi.'),
      latitude: coordinate('Latitude', 90),
      longitude: coordinate('Longitude', 180),
    })
    // The pair is checked here as well as on the server, which refuses half a
    // coordinate with a 400. Catching it in the form puts the message under the
    // field that is missing instead of in a toast that does not say which.
    .refine((v) => (v.latitude === null) === (v.longitude === null), {
      message:
        'Isi Latitude dan Longitude bersama-sama, atau kosongkan keduanya.',
      path: ['longitude'],
    }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    street: '',
    rt: '',
    rw: '',
    village: '',
    district: '',
    city: '',
    province: '',
    country: 'Indonesia',
    postalCode: '',
    latitude: null,
    longitude: null,
  },
})

watch(
  () => props.draftAddress,
  (newVal) => {
    form.resetForm({
      values: {
        street: newVal.street || '',
        rt: newVal.rt || '',
        rw: newVal.rw || '',
        village: newVal.village || '',
        district: newVal.district || '',
        city: newVal.city || '',
        province: newVal.province || '',
        country: newVal.country || 'Indonesia',
        postalCode: newVal.postalCode || '',
        // `??` rather than `||`: 0 is a real coordinate, and would otherwise
        // reset itself to null every time the form reloaded.
        latitude: newVal.latitude ?? null,
        longitude: newVal.longitude ?? null,
      },
    })
  },
  { immediate: true, deep: true },
)

const onSave = form.handleSubmit((values) => {
  emit('update:draftAddress', values)
  emit('save')
})
</script>

<template>
  <div>
    <div class="px-6 pt-3 pb-6">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField
          v-slot="{ componentField }"
          name="street"
        >
          <FormItem class="content-start md:col-span-2">
            <FormLabel
              >Alamat <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Textarea
                placeholder="Masukkan alamat jalan/kampung/komplek"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="rt"
        >
          <FormItem class="content-start">
            <FormLabel>RT</FormLabel>
            <FormControl>
              <Input
                placeholder="001"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="rw"
        >
          <FormItem class="content-start">
            <FormLabel>RW</FormLabel>
            <FormControl>
              <Input
                placeholder="002"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="village"
        >
          <FormItem class="content-start">
            <FormLabel
              >Kelurahan / Desa
              <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan kelurahan atau desa"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="district"
        >
          <FormItem class="content-start">
            <FormLabel
              >Kecamatan <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan kecamatan"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="city"
        >
          <FormItem class="content-start">
            <FormLabel
              >Kota / Kabupaten
              <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan kota atau kabupaten"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="province"
        >
          <FormItem class="content-start">
            <FormLabel
              >Provinsi <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan provinsi"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="country"
        >
          <FormItem class="content-start">
            <FormLabel
              >Negara <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan negara"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="postalCode"
        >
          <FormItem class="content-start">
            <FormLabel
              >Kode Pos <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan kode pos"
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
        {{ isSaving ? 'Menyimpan...' : 'Simpan & Selesai' }}
      </Button>
    </div>
  </div>
</template>
