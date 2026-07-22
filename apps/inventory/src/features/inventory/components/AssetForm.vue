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
import { Separator } from '@/ui/separator'

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

const schema = isEdit.value
  ? z.object({
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
      purchaseDate: z.string().min(1, 'Mohon tentukan tanggal pembelian.'),
      purchasePrice: z
        .number({ invalid_type_error: 'Nilai pembelian harus berupa angka.' })
        .min(0, 'Nilai pembelian tidak boleh kurang dari 0.'),
      fundingSourceId: z.string().optional().or(z.literal('none')),
      quantity: z.number().optional(),
      locationId: z.string().optional(),
      statusId: z.string().optional(),
      conditionId: z.string().optional(),
      notes: z.string().optional().or(z.literal('')),
    })
  : z.object({
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
      purchaseDate: z.string().min(1, 'Mohon tentukan tanggal pembelian.'),
      purchasePrice: z
        .number({ invalid_type_error: 'Nilai pembelian harus berupa angka.' })
        .min(0, 'Nilai pembelian tidak boleh kurang dari 0.'),
      fundingSourceId: z.string().optional().or(z.literal('none')),
      quantity: z
        .number({ invalid_type_error: 'Jumlah harus berupa angka.' })
        .int('Jumlah harus bilangan bulat.')
        .min(1, 'Jumlah minimal 1.'),
      locationId: z.string().min(1, 'Silakan pilih lokasi penempatan.'),
      statusId: z.string().min(1, 'Silakan tentukan status aset.'),
      conditionId: z.string().min(1, 'Silakan tentukan kondisi aset.'),
      notes: z.string().optional().or(z.literal('')),
    })

const formSchema = toTypedSchema(schema)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: props.asset
    ? {
        name: props.asset.name,
        categoryId: props.asset.categoryId,
        brand: props.asset.brand ?? '',
        model: props.asset.model ?? '',
        purchaseDate: props.asset.purchaseDate
          ? props.asset.purchaseDate.split('T')[0]
          : '',
        purchasePrice: Number(props.asset.purchasePrice),
        fundingSourceId: props.asset.fundingSourceId ?? 'none',
        quantity: 1,
        locationId: props.asset.units?.[0]?.locationId ?? '',
        statusId: props.asset.units?.[0]?.statusId ?? '',
        conditionId: props.asset.units?.[0]?.conditionId ?? '',
        notes: props.asset.notes ?? '',
      }
    : {
        name: '',
        categoryId: '',
        brand: '',
        model: '',
        purchaseDate: '',
        purchasePrice: 0,
        fundingSourceId: 'none',
        quantity: 1,
        locationId: '',
        statusId: '',
        conditionId: '',
        notes: '',
      },
})

watch(
  () => props.asset,
  (newAsset) => {
    if (newAsset) {
      const firstUnit = newAsset.units?.[0]
      resetForm({
        values: {
          name: newAsset.name,
          categoryId: newAsset.categoryId,
          brand: newAsset.brand ?? '',
          model: newAsset.model ?? '',
          purchaseDate: newAsset.purchaseDate
            ? newAsset.purchaseDate.split('T')[0]
            : '',
          purchasePrice: Number(newAsset.purchasePrice),
          fundingSourceId: newAsset.fundingSourceId ?? 'none',
          quantity: 1,
          locationId: firstUnit?.locationId ?? '',
          statusId: firstUnit?.statusId ?? '',
          conditionId: firstUnit?.conditionId ?? '',
          notes: newAsset.notes ?? '',
        },
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <!-- Section 1: Informasi Aset -->
      <div
        class="rounded-xl border bg-card p-5 space-y-4 text-sm flex flex-col"
      >
        <h3 class="text-sm font-semibold">Informasi Aset</h3>
        <Separator />
        <div class="grid grid-cols-2 gap-4">
          <!-- Asset Name -->
          <FormField
            v-slot="{ componentField, errorMessage }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Aset <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  v-bind="componentField"
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

          <!-- Brand -->
          <FormField
            v-slot="{ componentField, errorMessage }"
            name="brand"
          >
            <FormItem>
              <FormLabel>Merek</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Contoh: Asus, LG"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Model -->
          <FormField
            v-slot="{ componentField, errorMessage }"
            name="model"
          >
            <FormItem>
              <FormLabel>Model / Tipe</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Contoh: ROG, 24MK600"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

          <!-- Initial unit details — only meaningful when creating; units are
               otherwise managed individually in the Unit table below. -->
          <template v-if="!isEdit">
            <FormField
              v-slot="{ value, handleChange, errorMessage }"
              name="quantity"
            >
              <FormItem>
                <FormLabel
                  >Jumlah Unit
                  <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    :model-value="value"
                    :disabled="isSaving"
                    @update:model-value="handleChange(Number($event))"
                  />
                </FormControl>
                <FormMessage>{{ errorMessage }}</FormMessage>
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value, handleChange, errorMessage }"
              name="locationId"
            >
              <FormItem>
                <FormLabel
                  >Lokasi <span class="text-destructive">*</span></FormLabel
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

            <FormField
              v-slot="{ value, handleChange, errorMessage }"
              name="statusId"
            >
              <FormItem>
                <FormLabel
                  >Status <span class="text-destructive">*</span></FormLabel
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
                  >Kondisi <span class="text-destructive">*</span></FormLabel
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
          </template>
        </div>
      </div>

      <!-- Section 2: Keuangan & Administrasi -->
      <div
        class="rounded-xl border bg-card p-5 space-y-4 text-sm flex flex-col"
      >
        <h3 class="text-sm font-semibold">Keuangan & Administrasi</h3>
        <Separator />
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

        <!-- Purchase Price & Funding Source (50-50 split) -->
        <div class="grid grid-cols-2 gap-4 items-start">
          <FormField
            v-slot="{ value, handleChange, errorMessage }"
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
                  :model-value="value"
                  :disabled="isSaving"
                  @update:model-value="handleChange(Number($event))"
                />
              </FormControl>
              <FormMessage>{{ errorMessage }}</FormMessage>
            </FormItem>
          </FormField>

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
        </div>

        <!-- Notes -->
        <FormField
          v-slot="{ componentField, errorMessage }"
          name="notes"
        >
          <FormItem>
            <FormLabel>Catatan / Keterangan</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                placeholder="Masukkan catatan tambahan mengenai aset"
                :disabled="isSaving"
                rows="4"
                class="resize-none"
                style="field-sizing: fixed"
              />
            </FormControl>
            <FormMessage>{{ errorMessage }}</FormMessage>
          </FormItem>
        </FormField>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex items-center justify-end gap-3 pt-2">
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
