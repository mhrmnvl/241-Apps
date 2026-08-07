<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { NotFoundView } from '@/features/platform/auth'
import { Badge } from '@/ui/badge'
import PostCard from '../components/PostCard.vue'
import { postService } from '../services/postService'
import { usePublicPostStore } from '../stores/publicPostStore'
import { POST_TYPE_SLUGS, type PostType } from '../types'

const route = useRoute()
const store = usePublicPostStore()

const type = computed(() => (route.meta.postType ?? 'BERITA') as PostType)
const slug = computed(() => String(route.params.slug ?? ''))
const listPath = computed(() => `/${POST_TYPE_SLUGS[type.value]}`)

watch(
  [type, slug],
  () => {
    if (slug.value) void postService.fetchPublicDetail(type.value, slug.value)
  },
  { immediate: true },
)

const publishedLabel = computed(() => {
  const published = store.current?.publishedAt
  if (!published) return ''
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(published))
})
</script>

<template>
  <p
    v-if="store.loading"
    class="text-center text-sm text-muted-foreground"
  >
    Memuat…
  </p>

  <!--
    Unknown slug, draft, scheduled, archived, and deleted all arrive here as the
    same 404 and render the same page — nothing on screen distinguishes them
    (FR-022, FR-026). The platform's NotFoundView is rendered directly rather
    than the app's NotFoundPage.vue, because that component picks its own shell
    and we are already inside the public one. The address is left untouched: the
    visitor pasted it, and rewriting it would hide what they actually opened.
  -->
  <NotFoundView v-else-if="store.notFound" />

  <div
    v-else-if="store.unavailable"
    class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
  >
    Konten sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
  </div>

  <article
    v-else-if="store.current"
    class="space-y-10"
  >
    <header class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <Badge
          v-if="store.current.category"
          variant="secondary"
        >
          {{ store.current.category.name }}
        </Badge>
        <span class="text-sm text-muted-foreground">{{ publishedLabel }}</span>
      </div>

      <h1 class="text-3xl font-bold leading-tight tracking-tight">
        {{ store.current.title }}
      </h1>

      <p class="text-muted-foreground">{{ store.current.summary }}</p>
      <p class="text-sm text-muted-foreground">
        Oleh {{ store.current.authorName }}
      </p>
    </header>

    <img
      v-if="store.current.coverImageUrl"
      :src="store.current.coverImageUrl"
      :alt="store.current.coverAltText ?? ''"
      class="w-full rounded-lg object-cover"
    />

    <!--
      The body is stored already sanitized (FR-010) — sanitization happens once,
      server-side, on write. Doing it again here would be a second copy of the
      policy, free to drift from the one that actually protects the database.
    -->
    <!-- eslint-disable vue/no-v-html -- see the note above: the body is stored
         post-sanitization, and re-sanitizing on read would be a second copy of
         the policy, free to drift from the one guarding the database. -->
    <div
      class="prose prose-neutral max-w-none dark:prose-invert"
      v-html="store.current.body"
    />
    <!-- eslint-enable vue/no-v-html -->

    <!-- The only way into a tag filter. A site this size has no use for a wall
         of every label; a reader who liked this article follows its tags. -->
    <nav
      v-if="store.current.tags.length > 0"
      class="flex flex-wrap items-center gap-2"
      aria-label="Tag"
    >
      <RouterLink
        v-for="tag in store.current.tags"
        :key="tag.id"
        :to="{ path: listPath, query: { tagSlug: tag.slug } }"
      >
        <Badge variant="outline">#{{ tag.name }}</Badge>
      </RouterLink>
    </nav>

    <a
      v-if="store.current.attachmentUrl"
      :href="store.current.attachmentUrl"
      class="inline-flex text-sm font-medium text-primary underline underline-offset-4"
    >
      Unduh lampiran
    </a>

    <section
      v-if="store.related.length > 0"
      class="space-y-4 border-t pt-8"
    >
      <h2 class="text-xl font-semibold">Konten lainnya</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <PostCard
          v-for="item in store.related"
          :key="item.id"
          :post="item"
        />
      </div>
    </section>
  </article>
</template>
