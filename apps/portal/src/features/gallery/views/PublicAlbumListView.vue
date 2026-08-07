<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Images, Loader2 } from 'lucide-vue-next'
import { Card, CardContent } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
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

    <div
      v-if="store.loading"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="space-y-3"
      >
        <Skeleton class="aspect-[4/3] w-full rounded-lg" />
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-1/2" />
      </div>
      <div
        class="col-span-full flex justify-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 class="size-4 animate-spin" />
        Memuat…
      </div>
    </div>

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
        class="group block"
      >
        <Card class="overflow-hidden transition-colors hover:border-primary/50">
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

          <CardContent class="flex flex-col gap-1 p-4">
            <h2 class="font-semibold leading-snug group-hover:text-primary">
              {{ album.title }}
            </h2>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(album.eventDate) }} · {{ album.photoCount }} foto
            </p>
          </CardContent>
        </Card>
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
