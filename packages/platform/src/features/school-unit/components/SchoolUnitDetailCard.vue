<script setup lang="ts">
import { computed, ref } from 'vue'
import { statusOptions } from '../constants'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import { formatCoordinate, formatValue, hasCoordinates } from '../utils'
import SchoolLocationDialog from './SchoolLocationDialog.vue'
import SchoolLocationMap from './SchoolLocationMap.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import {
  Building2,
  MapPin,
  MapPinned,
  Maximize2,
  ExternalLink,
  AlertCircle,
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    schoolUnit: SchoolUnitProfile
    address: SchoolUnitAddress
    isLoading?: boolean
    loadError?: string | null
  }>(),
  {
    isLoading: false,
    loadError: null,
  },
)

const statusOption = computed(() =>
  statusOptions.find((option) => option.value === props.schoolUnit.status),
)

const statusLabel = computed(
  () => statusOption.value?.label ?? props.schoolUnit.status ?? '-',
)

const typeLabel = computed(
  () => props.schoolUnit.type?.name ?? props.schoolUnit.type?.code ?? '-',
)

const isLocationDialogOpen = ref(false)

// The pin belongs to the address, not to the institution. A school with no
// address has no pin, and the card renders its empty state for that.
const hasPin = computed(() => hasCoordinates(props.address))

const mapTitle = computed(
  () => props.schoolUnit.surname || props.schoolUnit.name,
)

const hasValidAddress = computed(() => {
  const a = props.address
  return Boolean(
    a.street || a.village || a.district || a.city || a.province || a.postalCode,
  )
})
</script>

<template>
  <div class="p-6">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3"
    >
      <div
        class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
      />
      <p>Memuat data unit sekolah...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="loadError"
      class="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
    >
      <div
        class="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-3"
      >
        <AlertCircle class="size-6" />
      </div>
      <h3 class="text-base font-semibold text-foreground">Gagal Memuat Data</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ loadError }}
      </p>
    </div>

    <!-- Main Content: Category Cards inside Main Card -->
    <div
      v-else
      class="space-y-6"
    >
      <!-- Row 1: Identitas & Legalitas + Kontak (single full-width card) -->
      <Card class="rounded-xl shadow-xs py-0 gap-0">
        <CardHeader
          class="flex flex-row items-center gap-2.5 border-b px-5 py-3.5 pb-3.5!"
        >
          <Building2 class="size-4 text-primary shrink-0" />
          <CardTitle class="text-sm font-semibold tracking-normal">
            Identitas, Legalitas &amp; Kontak
          </CardTitle>
        </CardHeader>

        <CardContent class="px-5 pt-3.5 pb-5">
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nama Resmi
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.name) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nama Alias
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.surname) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nomor Pokok Sekolah Nasional (NPSN)
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.npsn) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nomor Statistik Madrasah (NSM)
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.nsm) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">Status</dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(statusLabel) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">Jenjang</dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(typeLabel) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nomor Pokok Wajib Pajak (NPWP)
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.npwp) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Nomor Telepon
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.phone) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Email Resmi
              </dt>
              <dd class="font-semibold text-foreground mt-0.5">
                {{ formatValue(schoolUnit.email) }}
              </dd>
            </div>

            <div>
              <dt class="text-xs font-medium text-muted-foreground">
                Situs Web Resmi
              </dt>
              <dd class="mt-0.5">
                <a
                  v-if="schoolUnit.website"
                  :href="
                    schoolUnit.website.startsWith('http')
                      ? schoolUnit.website
                      : `https://${schoolUnit.website}`
                  "
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-1.5 font-medium text-primary hover:underline break-all"
                >
                  {{ schoolUnit.website }}
                  <ExternalLink class="size-3 shrink-0 opacity-70" />
                </a>
                <span
                  v-else
                  class="font-semibold text-foreground"
                  >-</span
                >
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <!-- Row 2: Alamat & Titik Lokasi -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 4. Alamat Lembaga -->
        <Card class="rounded-xl shadow-xs py-0 gap-0">
          <CardHeader
            class="flex flex-row items-center gap-2.5 border-b px-5 py-3.5 pb-3.5!"
          >
            <MapPin class="size-4 text-primary shrink-0" />
            <CardTitle class="text-sm font-semibold tracking-normal">
              Alamat Lembaga
            </CardTitle>
          </CardHeader>

          <CardContent class="px-5 pt-3.5 pb-5">
            <dl
              v-if="hasValidAddress"
              class="grid grid-cols-2 gap-y-3.5 gap-x-6 text-sm"
            >
              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Jalan / Gedung
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.street) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  RT / RW
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{
                    address.rt || address.rw
                      ? `${address.rt || '-'} / ${address.rw || '-'}`
                      : '-'
                  }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Kelurahan / Desa
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.village) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Kecamatan
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.district) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Kabupaten / Kota
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.city) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Provinsi
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.province) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Kode Pos
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.postalCode) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Negara
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatValue(address.country || 'Indonesia') }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card class="rounded-xl shadow-xs py-0 gap-0">
          <CardHeader
            class="flex flex-row items-center gap-2.5 border-b px-5 py-3.5 pb-3.5!"
          >
            <MapPinned class="size-4 text-primary shrink-0" />
            <CardTitle class="text-sm font-semibold tracking-normal">
              Titik Lokasi
            </CardTitle>
          </CardHeader>

          <CardContent class="px-5 pt-3.5 pb-5 space-y-4">
            <!-- The preview is a button: the map inside it is scenery, so clicks
               pass through to the control that opens the real map. -->
            <button
              v-if="hasPin"
              type="button"
              class="group relative block h-44 w-full overflow-hidden rounded-lg border transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              :aria-label="`Perbesar peta lokasi ${mapTitle}`"
              @click="isLocationDialogOpen = true"
            >
              <div
                class="pointer-events-none absolute inset-0 overflow-hidden isolate"
              >
                <SchoolLocationMap
                  :latitude="address.latitude as number"
                  :longitude="address.longitude as number"
                  :title="mapTitle"
                  :zoom="15"
                  :interactive="false"
                />
              </div>
              <span
                class="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition group-hover:bg-background/55 group-hover:opacity-100 group-focus-visible:bg-background/55 group-focus-visible:opacity-100"
              >
                <span
                  class="inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1.5 text-xs font-medium shadow-sm"
                >
                  <Maximize2 class="size-3.5" />
                  Lihat detail
                </span>
              </span>
            </button>

            <div
              v-else
              class="flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 text-center"
            >
              <MapPinned class="size-6 text-muted-foreground" />
              <p class="text-sm font-medium text-foreground">Belum diatur</p>
              <p class="text-xs text-muted-foreground">
                Isi koordinat pada form Informasi Lembaga.
              </p>
            </div>

            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Latitude
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatCoordinate(address.latitude ?? null) }}
                </dd>
              </div>

              <div>
                <dt class="text-xs font-medium text-muted-foreground">
                  Longitude
                </dt>
                <dd class="font-medium text-foreground mt-0.5">
                  {{ formatCoordinate(address.longitude ?? null) }}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>

    <SchoolLocationDialog
      v-model:open="isLocationDialogOpen"
      :address="address"
    />
  </div>
</template>
