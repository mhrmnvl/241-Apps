<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NotFoundView } from '@/features/platform/auth'
import { CalendarDays, MapPin, Loader2 } from 'lucide-vue-next'
import { Skeleton } from '@/ui/skeleton'
import { Separator } from '@/ui/separator'
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
  <div
    v-if="store.loading"
    class="space-y-6"
  >
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 class="size-4 animate-spin" />
      Memuat…
    </div>
    <Skeleton class="h-8 w-3/4" />
    <Skeleton class="h-4 w-1/2" />
    <Skeleton class="aspect-video w-full rounded-lg" />
    <div class="space-y-2">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  </div>

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
      <div class="flex flex-wrap gap-x-4 gap-y-1.5">
        <p class="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays class="size-4 shrink-0" />
          {{ when }}
        </p>
        <p class="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin class="size-4 shrink-0" />
          {{ store.publicCurrent.location }}
        </p>
      </div>
    </header>

    <Separator />

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
