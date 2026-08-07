<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NotFoundView } from '@/features/platform/auth'
import { CalendarDays, MapPin } from 'lucide-vue-next'
import { agendaService } from '../services/agendaService'
import { useAgendaStore } from '../stores/agendaStore'

const route = useRoute()
const store = useAgendaStore()

const slug = computed(() => String(route.params.slug ?? ''))

watch(
  slug,
  () => {
    if (slug.value) void agendaService.fetchPublicDetail(slug.value)
  },
  { immediate: true },
)

const when = computed(() => {
  const entry = store.publicCurrent
  if (!entry) return ''

  const format = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })
  return `${format.format(new Date(entry.startTime))} – ${format.format(new Date(entry.endTime))} WIB`
})
</script>

<template>
  <p
    v-if="store.loading"
    class="text-center text-sm text-muted-foreground"
  >
    Memuat…
  </p>

  <NotFoundView v-else-if="store.notFound" />

  <div
    v-else-if="store.unavailable"
    class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
  >
    Agenda sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
  </div>

  <article
    v-else-if="store.publicCurrent"
    class="space-y-8"
  >
    <header class="space-y-3">
      <h1 class="text-3xl font-bold leading-tight tracking-tight">
        {{ store.publicCurrent.title }}
      </h1>
      <p class="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays class="size-4 shrink-0" />
        {{ when }}
      </p>
      <p class="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin class="size-4 shrink-0" />
        {{ store.publicCurrent.location }}
      </p>
    </header>

    <img
      v-if="store.publicCurrent.coverImageUrl"
      :src="store.publicCurrent.coverImageUrl"
      :alt="store.publicCurrent.title"
      class="w-full rounded-lg object-cover"
    />

    <!-- Stored already sanitized; see PublicPostDetailView for the full note. -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="prose prose-neutral max-w-none dark:prose-invert"
      v-html="store.publicCurrent.description"
    />
    <!-- eslint-enable vue/no-v-html -->
  </article>
</template>
