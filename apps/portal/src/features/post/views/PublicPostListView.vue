<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { categoryService, type PublicPostCategory } from '@/features/taxonomy'
import PagePagination from '@/components/PagePagination.vue'
import PostCard from '../components/PostCard.vue'
import { postService } from '../services/postService'
import { usePublicPostStore } from '../stores/publicPostStore'
import { POST_TYPE_LABELS, type PostType } from '../types'

const route = useRoute()
const router = useRouter()
const store = usePublicPostStore()

const type = computed(() => (route.meta.postType ?? 'BERITA') as PostType)
const heading = computed(() => POST_TYPE_LABELS[type.value])

/**
 * The page number lives in the address, not in component state (FR-021): page 3
 * has to be linkable, bookmarkable, and survive a reload — which it cannot if
 * the only record of it is a ref.
 */
const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

// The filters live in the address too, for the same reason the page does: a
// visitor sharing "berita tentang prestasi" is sharing a link, not a click path
// (FR-023, FR-024).
const categorySlug = computed(() => stringQuery('categorySlug'))
const tagSlug = computed(() => stringQuery('tagSlug'))
const search = computed(() => stringQuery('q'))

function stringQuery(key: string): string | undefined {
  const raw = route.query[key]
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined
}

const categories = ref<PublicPostCategory[]>([])
const searchDraft = ref(search.value ?? '')

onMounted(async () => {
  categories.value = await categoryService.listPublic()
})

function load() {
  void postService.fetchPublicList({
    type: type.value,
    page: page.value,
    categorySlug: categorySlug.value,
    tagSlug: tagSlug.value,
    search: search.value,
  })
}

watch([type, page, categorySlug, tagSlug, search], load, { immediate: true })

/** Any filter change resets to page 1 — page 4 of a narrower result set is
 *  usually empty, and an empty page reads as "nothing matched". */
function setFilter(key: string, value: string | undefined) {
  // An empty string is "no filter", not "match the empty string" — dropping the
  // key entirely is what keeps the address clean when a filter is cleared.
  const next = value !== undefined && value.length > 0 ? value : undefined
  void router.push({ query: { ...route.query, page: undefined, [key]: next } })
}

function clearFilters() {
  void router.push({ query: {} })
  searchDraft.value = ''
}

const hasFilters = computed(
  () =>
    categorySlug.value !== undefined ||
    tagSlug.value !== undefined ||
    search.value !== undefined,
)
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">{{ heading }}</h1>
      <p class="text-sm text-muted-foreground">
        Kabar dan informasi terbaru dari MTs Persis 241 Al-Ikhlash.
      </p>
    </header>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        :variant="categorySlug ? 'outline' : 'default'"
        size="sm"
        @click="setFilter('categorySlug', undefined)"
      >
        Semua
      </Button>
      <Button
        v-for="category in categories"
        :key="category.id"
        :variant="categorySlug === category.slug ? 'default' : 'outline'"
        size="sm"
        @click="setFilter('categorySlug', category.slug)"
      >
        {{ category.name }}
        <span class="ml-1.5 text-xs opacity-70">
          {{ category.publishedCount }}
        </span>
      </Button>

      <form
        class="ml-auto flex items-center gap-2"
        @submit.prevent="setFilter('q', searchDraft)"
      >
        <Input
          v-model="searchDraft"
          type="search"
          placeholder="Cari…"
          class="w-48"
          aria-label="Cari konten"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
        >
          Cari
        </Button>
      </form>
    </div>

    <!-- A tag filter arrives from a link on a detail page rather than from a
         list of every tag, which on a school site would be a wall of labels. -->
    <div
      v-if="hasFilters"
      class="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <span v-if="tagSlug">Tag: {{ tagSlug }}</span>
      <span v-if="search">Pencarian: “{{ search }}”</span>
      <Button
        variant="link"
        size="sm"
        class="px-1"
        @click="clearFilters"
      >
        Hapus filter
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
      Konten sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
    </div>

    <div
      v-else-if="store.items.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
    >
      <template v-if="hasFilters">
        Tidak ada {{ heading.toLowerCase() }} yang cocok dengan filter ini.
      </template>
      <template v-else> Belum ada {{ heading.toLowerCase() }}. </template>
    </div>

    <template v-else>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PostCard
          v-for="item in store.items"
          :key="item.id"
          :post="item"
        />
      </div>

      <PagePagination
        :page="page"
        :total="store.total"
        :limit="store.limit"
      />
    </template>
  </div>
</template>
