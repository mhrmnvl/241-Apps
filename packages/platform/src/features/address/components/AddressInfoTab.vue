<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Loader2 } from 'lucide-vue-next'
import { useAddress } from '../composables/useAddress'
import type { AddressData, AddressRecord, AddressSavePayload } from '../types'

const props = defineProps<{
  data: AddressData
  rawAddress?: AddressRecord | null
  isEditable: boolean
}>()

const emit = defineEmits<{
  save: [payload: AddressSavePayload]
}>()

const { isSaving } = useAddress()

const form = reactive({
  street: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  country: 'Indonesia',
  postalCode: '',
})

watch(
  () => [props.rawAddress, props.data.address] as const,
  ([rawAddr, dataAddr]) => {
    const addr = rawAddr || dataAddr
    if (addr) {
      form.street = addr.street ?? ''
      form.rt = addr.rt ?? ''
      form.rw = addr.rw ?? ''
      form.village = addr.village ?? ''
      form.district = addr.district ?? ''
      form.city = addr.city ?? ''
      form.province = addr.province ?? ''
      form.country = addr.country ?? 'Indonesia'
      form.postalCode = addr.postalCode ?? ''
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!props.isEditable) return
  emit('save', {
    street: form.street,
    rt: form.rt === '' ? null : form.rt,
    rw: form.rw === '' ? null : form.rw,
    village: form.village,
    district: form.district,
    city: form.city,
    province: form.province,
    country: form.country,
    postalCode: form.postalCode === '' ? null : form.postalCode,
  })
}
</script>

<template>
  <div class="py-4">
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-5 md:grid-cols-2">
        <!-- Jalan / Dusun -->
        <div class="space-y-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-foreground">
            Jalan / Dusun
            <span
              v-if="isEditable"
              class="text-destructive"
              >*</span
            >
          </label>
          <Input
            v-model="form.street"
            placeholder="Nama Jalan, Gedung, No. Rumah"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </div>

        <!-- RT -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">RT</label>
          <Input
            v-model="form.rt"
            placeholder="RT"
            maxlength="5"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </div>

        <!-- RW -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">RW</label>
          <Input
            v-model="form.rw"
            placeholder="RW"
            maxlength="5"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </div>

        <!-- Desa / Kelurahan -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">
            Desa / Kelurahan
            <span
              v-if="isEditable"
              class="text-destructive"
              >*</span
            >
          </label>
          <Input
            v-model="form.village"
            placeholder="Nama Desa atau Kelurahan"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </div>

        <!-- Kecamatan -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">
            Kecamatan
            <span
              v-if="isEditable"
              class="text-destructive"
              >*</span
            >
          </label>
          <Input
            v-model="form.district"
            placeholder="Nama Kecamatan"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </div>

        <!-- Kabupaten / Kota -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">
            Kabupaten / Kota
            <span
              v-if="isEditable"
              class="text-destructive"
              >*</span
            >
          </label>
          <Input
            v-model="form.city"
            placeholder="Nama Kabupaten atau Kota"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </div>

        <!-- Provinsi -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">
            Provinsi
            <span
              v-if="isEditable"
              class="text-destructive"
              >*</span
            >
          </label>
          <Input
            v-model="form.province"
            placeholder="Nama Provinsi"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </div>

        <!-- Negara -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Negara</label>
          <Input
            v-model="form.country"
            placeholder="Negara"
            disabled
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </div>

        <!-- Kode Pos -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Kode Pos</label>
          <Input
            v-model="form.postalCode"
            placeholder="Kode Pos"
            maxlength="10"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        v-if="isEditable"
        class="flex justify-end gap-3 pt-4"
      >
        <Button
          type="submit"
          :disabled="isSaving"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </div>
    </form>
  </div>
</template>
