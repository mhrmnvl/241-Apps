<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * A Leaflet map showing one pin: where the school is.
 *
 * Used twice on the profile — a still preview inside the location card, and an
 * interactive map inside the dialog that card opens — so the tile layer, the
 * marker and the teardown live here once rather than in both.
 */
const props = withDefaults(
  defineProps<{
    latitude: number
    longitude: number
    /**
     * A preview is scenery, not a control: dragging or scrolling it would
     * fight the page, and the card is a button that opens the real map.
     */
    interactive?: boolean
    zoom?: number
    /** Label for the marker's tooltip; the school's name reads better than coordinates. */
    title?: string
  }>(),
  { interactive: true, zoom: 16, title: '' },
)

const containerRef = useTemplateRef<HTMLDivElement>('container')

let map: L.Map | null = null
let marker: L.Marker | null = null

/**
 * A `divIcon` rather than Leaflet's default marker image.
 *
 * The default icon resolves its PNGs relative to the CSS file, which Vite
 * rewrites during bundling — the classic "marker is a broken image in
 * production" bug. Drawing the pin in CSS sidesteps the asset pipeline
 * entirely and lets it take the app's primary colour in both themes.
 */
function createPin() {
  return L.divIcon({
    className: 'school-pin',
    html: '<span class="school-pin__dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function createMap() {
  if (!containerRef.value) return

  map = L.map(containerRef.value, {
    center: [props.latitude, props.longitude],
    zoom: props.zoom,
    // Every one of these is a way for a still preview to start behaving like a
    // control; `zoomControl` is separate because it is chrome, not a gesture.
    dragging: props.interactive,
    scrollWheelZoom: false,
    doubleClickZoom: props.interactive,
    touchZoom: props.interactive,
    boxZoom: props.interactive,
    keyboard: props.interactive,
    zoomControl: props.interactive,
    attributionControl: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  marker = L.marker([props.latitude, props.longitude], {
    icon: createPin(),
    keyboard: false,
    interactive: props.interactive,
  }).addTo(map)

  if (props.title) marker.bindTooltip(props.title, { direction: 'top' })

  // A map built inside a dialog measures itself before the dialog has finished
  // opening, and lays its tiles out for a box of zero height. One frame later
  // the box is real, so re-measure then.
  requestAnimationFrame(() => map?.invalidateSize())
}

onMounted(createMap)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
})

watch(
  () => [props.latitude, props.longitude] as const,
  ([lat, lng]) => {
    if (!map || !marker) return
    const next = L.latLng(lat, lng)
    marker.setLatLng(next)
    map.setView(next, map.getZoom())
  },
)
</script>

<template>
  <div
    ref="container"
    class="school-map h-full w-full overflow-hidden isolate"
    role="img"
    :aria-label="
      title
        ? `Peta lokasi ${title}`
        : `Peta lokasi pada ${latitude}, ${longitude}`
    "
  />
</template>

<style>
/* Unscoped on purpose: Leaflet builds the pin element itself, so a scoped
   rule's data attribute would never reach it. */
.school-pin__dot {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: var(--primary);
  border: 3px solid var(--background);
  box-shadow: 0 1px 6px rgb(0 0 0 / 0.35);
}

.school-map .leaflet-container {
  background: var(--muted);
  font-family: inherit;
}

.school-map .leaflet-control-attribution {
  background: color-mix(in oklab, var(--background) 82%, transparent);
  color: var(--muted-foreground);
  font-size: 10px;
}

.school-map .leaflet-control-attribution a {
  color: var(--primary);
}
</style>
