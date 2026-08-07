<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Paperclip } from 'lucide-vue-next'
import PagePagination from '@/components/PagePagination.vue'
import { postService } from '../services/postService'
import { usePublicPostStore } from '../stores/publicPostStore'

/**
 * Announcements read as a list of notices rather than a grid of cards: they are
 * short, dated, and scanned rather than browsed, and a cover image is optional
 * where it is effectively required for a Berita.
 */
const route = useRoute()
const router = useRouter()
const store = usePublicPostStore()

const scope = computed<'active' | 'archive'>(() =>
  route.query.scope === 'archive' ? 'archive' : 'active',
)

const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

watch(
  [scope, page],
  () => {
    void postService.fetchPublicList({
      type: 'PENGUMUMAN',
      scope: scope.value,
      page: page.value,
    })
  },
  { immediate: true },
)

function setScope(next: 'active' | 'archive') {
  void router.push({ query: next === 'active' ? {} : { scope: next } })
}

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
      <h1 class="text-2xl font-bold tracking-tight">Pengumuman</h1>
      <p class="text-sm text-muted-foreground">
        Informasi resmi dari MTs Persis 241 Al-Ikhlash.
      </p>
    </header>

    <div
      class="flex items-center gap-2"
      role="tablist"
    >
      <Button
        :variant="scope === 'active' ? 'default' : 'outline'"
        size="sm"
        role="tab"
        :aria-selected="scope === 'active'"
        @click="setScope('active')"
      >
        Berlaku
      </Button>
      <Button
        :variant="scope === 'archive' ? 'default' : 'outline'"
        size="sm"
        role="tab"
        :aria-selected="scope === 'archive'"
        @click="setScope('archive')"
      >
        Arsip
      </Button>
    </div>

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
      Pengumuman sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
    </div>

    <div
      v-else-if="store.items.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
    >
      <template v-if="scope === 'active'">
        Tidak ada pengumuman yang sedang berlaku.
      </template>
      <template v-else> Belum ada pengumuman yang kedaluwarsa. </template>
    </div>

    <ul
      v-else
      class="divide-y rounded-lg border"
    >
      <li
        v-for="item in store.items"
        :key="item.id"
      >
        <RouterLink
          :to="`/pengumuman/${item.slug}`"
          class="block space-y-1.5 p-4 transition-colors hover:bg-muted/50"
        >
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              v-if="item.isPinned"
              variant="secondary"
            >
              Penting
            </Badge>
            <span class="text-xs text-muted-foreground">
              {{ formatDate(item.publishedAt) }}
            </span>
          </div>

          <p class="font-semibold leading-snug">{{ item.title }}</p>
          <p class="line-clamp-2 text-sm text-muted-foreground">
            {{ item.summary }}
          </p>
        </RouterLink>
      </li>
    </ul>

    <PagePagination
      v-if="!store.loading && !store.unavailable"
      :page="page"
      :total="store.total"
      :limit="store.limit"
    />

    <!-- The attachment indicator lives on the detail page rather than here:
         the listing payload is a summary and does not carry it. -->
    <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Paperclip class="size-3.5" />
      Sebagian pengumuman menyertakan lampiran yang dapat diunduh.
    </p>
  </div>
</template>
