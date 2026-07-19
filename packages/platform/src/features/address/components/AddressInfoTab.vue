<script setup lang="ts">
import { computed } from 'vue'
import { Home, MapPin, Map, Navigation, Mail } from 'lucide-vue-next'
import type { AddressData } from '../types'

const props = defineProps<{ data: AddressData }>()

const fullAddress = computed(() => {
  if (!props.data?.address) return '-'
  const a = props.data.address
  const parts = []
  if (a.street) parts.push(a.street)
  if (a.rt || a.rw) parts.push(`RT ${a.rt ?? '-'} / RW ${a.rw ?? '-'}`)
  if (a.village) parts.push(`Desa/Kel. ${a.village}`)
  if (a.district) parts.push(`Kec. ${a.district}`)
  if (a.city) parts.push(a.city)
  if (a.province) parts.push(`Prov. ${a.province}`)
  if (a.postalCode) parts.push(a.postalCode)
  return parts.join(', ') || '-'
})
</script>
<template>
  <div class="py-4">
    <div
      v-if="data.address"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <div
        class="rounded-lg border bg-background p-4 shadow-sm md:col-span-2 xl:col-span-3"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Alamat Lengkap
          </p>
          <MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ fullAddress }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Jalan / Dusun</p>
          <Home class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.street || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">RT / RW</p>
          <MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.rt || '-' }} / {{ data.address.rw || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Desa / Kelurahan
          </p>
          <Map class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.village || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Kecamatan</p>
          <Map class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.district || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">
            Kabupaten / Kota
          </p>
          <Navigation class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.city || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Provinsi</p>
          <Map class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.province || '-' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Negara</p>
          <MapPin class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.country || 'Indonesia' }}
        </p>
      </div>

      <div class="rounded-lg border bg-background p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <p class="text-xs font-medium text-muted-foreground">Kode Pos</p>
          <Mail class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </div>
        <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
          {{ data.address.postalCode || '-' }}
        </p>
      </div>
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">Belum ada data alamat tercatat.</p>
    </div>
  </div>
</template>
