<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetSavePayload,
} from '../types'
import {
  Button,
  DatePicker,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/ui'

const props = defineProps<{
  asset?: InventoryAsset | null
  metadata: InventoryMetadata
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: [data: AssetSavePayload]
  cancel: []
}>()

const isEdit = computed(() => !!props.asset)

// Zod validation schema
const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Nama aset wajib diisi.')
      .max(150, 'Nama aset tidak boleh lebih dari 150 karakter.'),
    categoryId: z.string().min(1, 'Silakan pilih kategori aset.'),
    brand: z
      .string()
      .max(100, 'Merek tidak boleh lebih dari 100 karakter.')
      .optional()
      .or(z.literal('')),
    model: z
      .string()
      .max(100, 'Model tidak boleh lebih dari 100 karakter.')
      .optional()
      .or(z.literal('')),
    serialNumber: z
      .string()
      .max(100, 'Nomor seri tidak boleh lebih dari 100 karakter.')
      .optional()
      .or(z.literal('')),
    barcode: z
      .string()
      .max(100, 'Barcode tidak boleh lebih dari 100 karakter.')
      .optional()
      .or(z.literal('')),
    assetNumber: z
      .string()
      .max(100, 'Nomor aset tidak boleh lebih dari 100 karakter.')
      .optional()
      .or(z.literal('')),
    purchaseDate: z.string().min(1, 'Mohon tentukan tanggal pembelian.'),
    purchasePrice: z
      .number({ invalid_type_error: 'Nilai pembelian harus berupa angka.' })
      .min(0, 'Nilai pembelian tidak boleh kurang dari 0.'),
    usefulLifeMonths: z
      .number({ invalid_type_error: 'Masa manfaat harus berupa angka.' })
      .min(0, 'Masa manfaat tidak boleh kurang dari 0.')
      .optional(),
    fundingSourceId: z.string().optional().or(z.literal('none')),
    locationId: z.string().min(1, 'Silakan pilih lokasi penempatan.'),
    statusId: z.string().min(1, 'Silakan tentukan status aset.'),
    conditionId: z.string().min(1, 'Silakan tentukan kondisi aset.'),
    notes: z.string().optional().or(z.literal('')),
  }),
)

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    categoryId: '',
    brand: '',
    model: '',
    serialNumber: '',
    barcode: '',
    assetNumber: '',
    purchaseDate: '',
    purchasePrice: 0,
    usefulLifeMonths: 0,
    fundingSourceId: 'none',
    locationId: '',
    statusId: '',
    conditionId: '',
    notes: '',
  },
})

// Update values when editing an asset
watch(
  () => props.asset,
  (newAsset) => {
    if (newAsset) {
      setValues({
        name: newAsset.name,
        categoryId: newAsset.categoryId,
        brand: newAsset.brand ?? '',
        model: newAsset.model ?? '',
        serialNumber: newAsset.serialNumber ?? '',
        barcode: newAsset.barcode ?? '',
        assetNumber: newAsset.assetNumber ?? '',
        purchaseDate: newAsset.purchaseDate
          ? newAsset.purchaseDate.split('T')[0]
          : '',
        purchasePrice: Number(newAsset.purchasePrice),
        usefulLifeMonths: newAsset.usefulLifeMonths ?? 0,
        fundingSourceId: newAsset.fundingSourceId ?? 'none',
        locationId: newAsset.locationId,
        statusId: newAsset.statusId,
        conditionId: newAsset.conditionId,
        notes: newAsset.notes ?? '',
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Optional text fields: treat a blank input as "not provided" (omit from payload).
const blankToUndefined = (value?: string): string | undefined =>
  value && value.length > 0 ? value : undefined

const onSubmit = handleSubmit((values) => {
  emit('save', {
    ...values,
    brand: blankToUndefined(values.brand),
    model: blankToUndefined(values.model),
    serialNumber: blankToUndefined(values.serialNumber),
    barcode: blankToUndefined(values.barcode),
    assetNumber: blankToUndefined(values.assetNumber),
    fundingSourceId:
      values.fundingSourceId && values.fundingSourceId !== 'none'
        ? values.fundingSourceId
        : null,
    notes: blankToUndefined(values.notes),
  } as AssetSavePayload)
})
</script>

<template>
  <form
    class="space-y-6"
    @submit="onSubmit"
  >
    <!-- Form Sections: Side-by-Side 2 Columns (Informasi vs Keuangan) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Column 1: Informasi Aset -->
      <div class="space-y-4">
        <h3
          class="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2"
        >
          Informasi Aset
        </h3>

        <!-- Asset Name -->
        <FormField
          v-slot="{ field, errorMessage }"
          name="name"
        >
          <FormItem>
            <FormLabel
              >Nama Aset <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                v-bind="field"
                placeholder="Masukkan nama barang/aset"
                :disabled="isSaving"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Category -->
        <FormField
          v-slot="{ value, handleChange, errorMessage }"
          name="categoryId"
        >
          <FormItem>
            <FormLabel
              >Kategori <span class="text-destructive">*</span></FormLabel
            >
            <Select
              :model-value="value"
              :disabled="isSaving"
              @update:model-value="handleChange"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Pilih kategori aset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="cat in metadata.categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Brand & Model (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ field, errorMessage }"
            name="brand"
          >
            <FormItem>
              <FormLabel>Merek</FormLabel>
              <FormControl>
                <Input
                  v-bind="field"
                  placeholder="Contoh: Asus, LG"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ field, errorMessage }"
            name="model"
          >
            <FormItem>
              <FormLabel>Model / Tipe</FormLabel>
              <FormControl>
                <Input
                  v-bind="field"
                  placeholder="Contoh: ROG, 24MK600"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Serial Number & Barcode (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ field, errorMessage }"
            name="serialNumber"
          >
            <FormItem>
              <FormLabel>Nomor Seri Pabrik</FormLabel>
              <FormControl>
                <Input
                  v-bind="field"
                  placeholder="Masukkan nomor seri pabrik"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ field, errorMessage }"
            name="barcode"
          >
            <FormItem>
              <FormLabel>Barcode / QR Code</FormLabel>
              <FormControl>
                <Input
                  v-bind="field"
                  placeholder="Barcode label/kode"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Custom Asset Number -->
        <FormField
          v-slot="{ field, errorMessage }"
          name="assetNumber"
        >
          <FormItem>
            <FormLabel>Nomor Aset Kustom</FormLabel>
            <FormControl>
              <Input
                v-bind="field"
                placeholder="Kosongkan untuk auto-generate"
                :disabled="isSaving"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
      </div>

      <!-- Column 2: Keuangan & Administrasi -->
      <div class="space-y-4">
        <h3
          class="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2"
        >
          Keuangan & Administrasi
        </h3>

        <!-- Purchase Date -->
        <FormField
          v-slot="{ value, handleChange, errorMessage }"
          name="purchaseDate"
        >
          <FormItem>
            <FormLabel
              >Tanggal Pembelian
              <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <DatePicker
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>

        <!-- Purchase Price & Useful Life (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ field, errorMessage }"
            name="purchasePrice"
          >
            <FormItem>
              <FormLabel
                >Harga Beli (Rp)
                <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  type="number"
                  v-bind="field"
                  :disabled="isSaving"
                  @input="
                    field.onInput(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ field, errorMessage }"
            name="usefulLifeMonths"
          >
            <FormItem>
              <FormLabel>Masa Manfaat (Bulan)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  v-bind="field"
                  :disabled="isSaving"
                  @input="
                    field.onInput(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Funding Source & Location (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ value, handleChange, errorMessage }"
            name="fundingSourceId"
          >
            <FormItem>
              <FormLabel>Sumber Dana</FormLabel>
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">(Tanpa Sumber Dana)</SelectItem>
                  <SelectItem
                    v-for="fund in metadata.fundingSources"
                    :key="fund.id"
                    :value="fund.id"
                  >
                    {{ fund.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange, errorMessage }"
            name="locationId"
          >
            <FormItem>
              <FormLabel
                >Lokasi Aset <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="loc in metadata.locations"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Status & Condition (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ value, handleChange, errorMessage }"
            name="statusId"
          >
            <FormItem>
              <FormLabel
                >Status Aset <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in metadata.statuses"
                    :key="status.id"
                    :value="status.id"
                  >
                    {{ status.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange, errorMessage }"
            name="conditionId"
          >
            <FormItem>
              <FormLabel
                >Kondisi Aset <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="cond in metadata.conditions"
                    :key="cond.id"
                    :value="cond.id"
                  >
                    {{ cond.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>
        </div>

        <!-- Notes -->
        <FormField
          v-slot="{ field, errorMessage }"
          name="notes"
        >
          <FormItem>
            <FormLabel>Catatan / Keterangan</FormLabel>
            <FormControl>
              <Textarea
                v-bind="field"
                placeholder="Masukkan catatan tambahan mengenai aset"
                :disabled="isSaving"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        :disabled="isSaving"
        @click="emit('cancel')"
      >
        Batal
      </Button>
      <Button
        type="submit"
        :disabled="isSaving"
      >
        {{
          isSaving
            ? 'Menyimpan...'
            : isEdit
              ? 'Perbarui Aset'
              : 'Simpan Aset Baru'
        }}
      </Button>
    </div>
  </form>
</template>
