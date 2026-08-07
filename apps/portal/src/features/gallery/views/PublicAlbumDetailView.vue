<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NotFoundView } from '@/features/platform/auth'
import { Button } from '@/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { galleryService } from '../services/galleryService'
import { useGalleryStore } from '../stores/galleryStore'

const route = useRoute()
const store = useGalleryStore()

const slug = computed(() => String(route.params.slug ?? ''))
const photos = computed(() => store.publicAlbum?.photos.data ?? [])
const hasMore = computed(() => {
  const meta = store.publicAlbum?.photos.meta
  return meta ? meta.page < meta.totalPages : false
})

watch(
  slug,
  () => {
    if (slug.value) void galleryService.fetchPublicAlbum(slug.value)
  },
  { immediate: true },
)

/**
 * The lightbox index, or null when closed.
 *
 * Index rather than the photo itself, so the arrow keys can move through the
 * album without re-deriving position — and so a photo loaded by the next page
 * slots in behind the one being viewed without disturbing it.
 */
const lightboxIndex = ref<number | null>(null)

const activePhoto = computed(() =>
  lightboxIndex.value === null ? null : photos.value[lightboxIndex.value],
)

function open(index: number) {
  lightboxIndex.value = index
  window.addEventListener('keydown', onKeydown)
}

function close() {
  lightboxIndex.value = null
  window.removeEventListener('keydown', onKeydown)
}

function step(delta: number) {
  if (lightboxIndex.value === null) return
  const next = lightboxIndex.value + delta
  if (next < 0 || next >= photos.value.length) return
  lightboxIndex.value = next
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowRight') step(1)
  if (event.key === 'ArrowLeft') step(-1)
}

// The listener is on window, so it has to come off when the visitor navigates
// away with the lightbox still open.
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function loadMore() {
  void galleryService.fetchMorePhotos(slug.value)
}

const eventDate = computed(() => {
  const album = store.publicAlbum
  if (!album) return ''
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(album.eventDate))
})
</script>

<template>
  <p
    v-if="store.loading && !store.publicAlbum"
    class="text-center text-sm text-muted-foreground"
  >
    Memuat…
  </p>

  <NotFoundView v-else-if="store.notFound" />

  <div
    v-else-if="store.unavailable"
    class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
  >
    Album sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
  </div>

  <div
    v-else-if="store.publicAlbum"
    class="space-y-8"
  >
    <header class="space-y-2">
      <h1 class="text-3xl font-bold leading-tight tracking-tight">
        {{ store.publicAlbum.title }}
      </h1>
      <p class="text-sm text-muted-foreground">
        {{ eventDate }} · {{ store.publicAlbum.photoCount }} foto
      </p>
      <p
        v-if="store.publicAlbum.description"
        class="text-muted-foreground"
      >
        {{ store.publicAlbum.description }}
      </p>
    </header>

    <!--
      loading="lazy" plus explicit dimensions: the browser skips fetching what
      is off-screen, and the reserved box stops the page jumping as each photo
      lands. Together with the paginated fetch, that is what makes a 50-photo
      album usable within seconds on a mobile connection (FR-050, SC-015).
    -->
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        type="button"
        class="overflow-hidden rounded-md"
        :aria-label="`Buka foto: ${photo.altText}`"
        @click="open(index)"
      >
        <img
          :src="photo.imageUrl"
          :alt="photo.altText"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
          class="aspect-square w-full bg-muted object-cover transition-transform hover:scale-105"
        />
      </button>
    </div>

    <div
      v-if="hasMore"
      class="flex justify-center"
    >
      <Button
        variant="outline"
        :disabled="store.loadingMorePhotos"
        @click="loadMore"
      >
        {{ store.loadingMorePhotos ? 'Memuat…' : 'Muat lebih banyak' }}
      </Button>
    </div>
  </div>

  <!-- The lightbox. Rendered outside the grid so the backdrop covers the page,
       and dismissed by Escape, the close button, or a click on the backdrop. -->
  <div
    v-if="activePhoto"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
    role="dialog"
    aria-modal="true"
    @click.self="close"
  >
    <img
      :src="activePhoto.imageUrl"
      :alt="activePhoto.altText"
      class="max-h-[80vh] max-w-full object-contain"
    />

    <p
      v-if="activePhoto.caption"
      class="mt-4 max-w-2xl text-center text-sm text-white/80"
    >
      {{ activePhoto.caption }}
    </p>

    <div class="mt-4 flex items-center gap-4">
      <Button
        variant="secondary"
        size="icon"
        aria-label="Foto sebelumnya"
        :disabled="lightboxIndex === 0"
        @click="step(-1)"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <span class="text-sm text-white/70">
        {{ (lightboxIndex ?? 0) + 1 }} / {{ photos.length }}
      </span>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Foto berikutnya"
        :disabled="(lightboxIndex ?? 0) >= photos.length - 1"
        @click="step(1)"
      >
        <ChevronRight class="size-4" />
      </Button>
    </div>

    <Button
      variant="secondary"
      size="icon"
      class="absolute right-4 top-4"
      aria-label="Tutup"
      @click="close"
    >
      <X class="size-4" />
    </Button>
  </div>
</template>
