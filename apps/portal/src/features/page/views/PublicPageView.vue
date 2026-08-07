<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NotFoundView } from '@/features/platform/auth'
import { pageService } from '../services/pageService'
import { usePageStore } from '../stores/pageStore'

const route = useRoute()
const store = usePageStore()

const slug = computed(() => String(route.params.pageSlug ?? ''))

watch(
  slug,
  () => {
    if (slug.value) void pageService.fetchPublic(slug.value)
  },
  { immediate: true },
)
</script>

<template>
  <p
    v-if="store.loading"
    class="text-center text-sm text-muted-foreground"
  >
    Memuat…
  </p>

  <!--
    This view sits behind the catch-all route, so it is where every address the
    portal does not otherwise claim ends up. A draft page, a deleted one, and a
    typo in the URL all arrive as the same 404 and render the same page.
  -->
  <NotFoundView v-else-if="store.notFound" />

  <div
    v-else-if="store.unavailable"
    class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
  >
    Halaman sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
  </div>

  <article
    v-else-if="store.publicPage"
    class="space-y-8"
  >
    <h1 class="text-3xl font-bold leading-tight tracking-tight">
      {{ store.publicPage.title }}
    </h1>

    <!-- Stored already sanitized; see PublicPostDetailView for the full note. -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="prose prose-neutral max-w-none dark:prose-invert"
      v-html="store.publicPage.body"
    />
    <!-- eslint-enable vue/no-v-html -->
  </article>
</template>
