<script setup lang="ts">
import { computed } from 'vue'
import SchoolLocationMap from './SchoolLocationMap.vue'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import { buildFullAddress, formatCoordinate, hasCoordinates } from '../utils'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Copy, ExternalLink, MapPin, Navigation } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  schoolUnit: SchoolUnitProfile
  address: SchoolUnitAddress
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const hasPin = computed(() => hasCoordinates(props.schoolUnit))
const fullAddress = computed(() => buildFullAddress(props.address))

/** Both halves, in the order every mapping service reads them. */
const pairText = computed(() =>
  hasPin.value
    ? `${formatCoordinate(props.schoolUnit.latitude ?? null)}, ${formatCoordinate(
        props.schoolUnit.longitude ?? null,
      )}`
    : '-',
)

const googleMapsUrl = computed(() =>
  hasPin.value
    ? `https://www.google.com/maps/search/?api=1&query=${props.schoolUnit.latitude},${props.schoolUnit.longitude}`
    : '',
)

const openStreetMapUrl = computed(() =>
  hasPin.value
    ? `https://www.openstreetmap.org/?mlat=${props.schoolUnit.latitude}&mlon=${props.schoolUnit.longitude}#map=17/${props.schoolUnit.latitude}/${props.schoolUnit.longitude}`
    : '',
)

async function copyPair() {
  try {
    await navigator.clipboard.writeText(pairText.value)
    toast.success('Koordinat berhasil disalin ke clipboard')
  } catch {
    toast.error('Gagal menyalin koordinat')
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle class="flex items-center gap-2">
          <MapPin class="size-4 text-primary shrink-0" />
          Lokasi {{ schoolUnit.surname || schoolUnit.name }}
        </DialogTitle>
        <DialogDescription>
          {{ fullAddress }}
        </DialogDescription>
      </DialogHeader>

      <div class="px-6 py-5 space-y-4">
        <div
          v-if="hasPin"
          class="h-[380px] w-full overflow-hidden rounded-xl border"
        >
          <SchoolLocationMap
            :latitude="schoolUnit.latitude as number"
            :longitude="schoolUnit.longitude as number"
            :title="schoolUnit.surname || schoolUnit.name"
            :zoom="17"
          />
        </div>

        <div
          v-else
          class="flex h-[380px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center"
        >
          <MapPin class="size-8 text-muted-foreground" />
          <p class="text-sm font-medium text-foreground">
            Titik lokasi belum diatur
          </p>
          <p class="max-w-sm text-sm text-muted-foreground">
            Isi Latitude dan Longitude pada form Informasi Lembaga untuk
            menampilkan peta di sini.
          </p>
        </div>

        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt class="text-xs font-medium text-muted-foreground">Latitude</dt>
            <dd class="mt-0.5 font-mono font-semibold text-foreground">
              {{ formatCoordinate(schoolUnit.latitude ?? null) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-muted-foreground">Longitude</dt>
            <dd class="mt-0.5 font-mono font-semibold text-foreground">
              {{ formatCoordinate(schoolUnit.longitude ?? null) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-muted-foreground">
              Koordinat lengkap
            </dt>
            <dd
              class="mt-0.5 flex items-center gap-2 font-mono font-semibold text-foreground"
            >
              <span class="truncate">{{ pairText }}</span>
              <button
                v-if="hasPin"
                type="button"
                class="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Salin koordinat"
                @click="copyPair"
              >
                <Copy class="size-3.5" />
              </button>
            </dd>
          </div>
        </dl>

        <div
          v-if="hasPin"
          class="flex flex-wrap gap-2 border-t pt-4"
        >
          <Button
            as="a"
            :href="googleMapsUrl"
            target="_blank"
            rel="noreferrer"
            variant="default"
            size="sm"
          >
            <Navigation class="size-4" />
            Buka di Google Maps
          </Button>
          <Button
            as="a"
            :href="openStreetMapUrl"
            target="_blank"
            rel="noreferrer"
            variant="outline"
            size="sm"
          >
            <ExternalLink class="size-4" />
            Buka di OpenStreetMap
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
