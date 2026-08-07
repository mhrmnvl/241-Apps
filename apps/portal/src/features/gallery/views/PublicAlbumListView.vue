<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Images } from 'lucide-vue-next'
import PagePagination from '@/components/PagePagination.vue'
import { galleryService } from '../services/galleryService'
import { useGalleryStore } from '../stores/galleryStore'

const route = useRoute()
const store = useGalleryStore()

const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

watch(page, () => void galleryService.fetchPublicList(page.value), {
  immediate: true,
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Galeri</h1>
      <p class="text-sm text-muted-foreground">
        Dokumentasi kegiatan MTs Persis 241 Al-Ikhlash.
      </p>
    </header>

    <p
      v-if="store.loading"
      class="text-center text-sm text-muted-foreground"
    >
      Memuat…
    </p>

    <div
      v-else-if="store.unavailable"
      class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
    >
      Galeri sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
    </div>

    <div
      v-else-if="store.publicAlbums.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
    >
      Belum ada album foto.
    </div>

    <div
      v-else
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <RouterLink
        v-for="album in store.publicAlbums"
        :key="album.id"
        :to="`/galeri/${album.slug}`"
        class="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-primary/50"
      >
        <div class="aspect-[4/3] overflow-hidden bg-muted">
          <img
            v-if="album.coverImageUrl"
            :src="album.coverImageUrl"
            :alt="album.title"
            loading="lazy"
            class="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full items-center justify-center"
          >
            <Images class="size-8 text-muted-foreground" />
          </div>
        </div>

        <div class="flex flex-1 flex-col gap-1 p-4">
          <h2 class="font-semibold leading-snug group-hover:text-primary">
            {{ album.title }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ formatDate(album.eventDate) }} · {{ album.photoCount }} foto
          </p>
        </div>
      </RouterLink>
    </div>

    <PagePagination
      v-if="!store.loading && !store.unavailable"
      :page="page"
      :total="store.publicTotal"
      :limit="store.publicLimit"
    />
  </div>
</template>
