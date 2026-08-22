<script setup lang="ts">
import { computed } from 'vue'
import SchoolLocationMap from './SchoolLocationMap.vue'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import { buildFullAddress, formatCoordinate, hasCoordinates } from '../utils'
import { Button } from '@/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog'
import { ExternalLink, MapPin, Navigation } from 'lucide-vue-next'

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

// The pin belongs to the address, not to the institution.
const hasPin = computed(() => hasCoordinates(props.address))
const fullAddress = computed(() => buildFullAddress(props.address))

const googleMapsUrl = computed(() =>
  hasPin.value
    ? `https://www.google.com/maps/search/?api=1&query=${props.address.latitude},${props.address.longitude}`
    : '',
)

const openStreetMapUrl = computed(() =>
  hasPin.value
    ? `https://www.openstreetmap.org/?mlat=${props.address.latitude}&mlon=${props.address.longitude}#map=17/${props.address.latitude}/${props.address.longitude}`
    : '',
)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle class="flex items-center gap-2">
          <MapPin class="size-4 text-primary shrink-0" />
          Lokasi
        </DialogTitle>
      </DialogHeader>

      <div class="px-6 py-5 space-y-4">
        <div
          v-if="hasPin"
          class="h-[360px] w-full overflow-hidden rounded-xl border"
        >
          <SchoolLocationMap
            :latitude="address.latitude as number"
            :longitude="address.longitude as number"
            :title="schoolUnit.surname || schoolUnit.name"
            :zoom="17"
          />
        </div>

        <div
          v-else
          class="flex h-[360px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center"
        >
          <MapPin class="size-8 text-muted-foreground" />
          <p class="text-sm font-medium text-foreground">
            Titik lokasi belum diatur
          </p>
          <p class="max-w-sm text-sm text-muted-foreground">
            Isi Latitude dan Longitude pada form Alamat untuk menampilkan peta
            di sini.
          </p>
        </div>

        <dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt class="text-xs font-medium text-muted-foreground">
              Nama Resmi
            </dt>
            <dd class="mt-0.5 font-semibold text-foreground">
              {{ schoolUnit.name || '-' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-muted-foreground">
              Nama Singkat
            </dt>
            <dd class="mt-0.5 font-semibold text-foreground">
              {{ schoolUnit.surname || '-' }}
            </dd>
          </div>

          <div class="col-span-2">
            <dt class="text-xs font-medium text-muted-foreground">Alamat</dt>
            <dd class="mt-0.5 font-medium text-foreground leading-relaxed">
              {{ fullAddress || '-' }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-muted-foreground">Latitude</dt>
            <dd class="mt-0.5 font-semibold text-foreground">
              {{ formatCoordinate(address.latitude ?? null) }}
            </dd>
          </div>

          <div>
            <dt class="text-xs font-medium text-muted-foreground">Longitude</dt>
            <dd class="mt-0.5 font-semibold text-foreground">
              {{ formatCoordinate(address.longitude ?? null) }}
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
