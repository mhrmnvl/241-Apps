<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/ui/button'
import PagePagination from '@/components/PagePagination.vue'
import AgendaCard from '../components/AgendaCard.vue'
import { agendaService } from '../services/agendaService'
import { useAgendaStore } from '../stores/agendaStore'
import type { AgendaScope } from '../types'

const route = useRoute()
const router = useRouter()
const store = useAgendaStore()

// The tab lives in the address so "agenda yang sudah lewat" is a link.
const scope = computed<AgendaScope>(() =>
  route.query.scope === 'past' ? 'past' : 'upcoming',
)

const page = computed(() => {
  const raw = Number(route.query.page)
  return Number.isInteger(raw) && raw > 0 ? raw : 1
})

watch(
  [scope, page],
  () => {
    void agendaService.fetchPublicList({ scope: scope.value, page: page.value })
  },
  { immediate: true },
)

function setScope(next: AgendaScope) {
  void router.push({ query: next === 'upcoming' ? {} : { scope: next } })
}
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold tracking-tight">Agenda</h1>
      <p class="text-sm text-muted-foreground">
        Kegiatan MTs Persis 241 Al-Ikhlash.
      </p>
    </header>

    <div
      class="flex items-center gap-2"
      role="tablist"
    >
      <Button
        :variant="scope === 'upcoming' ? 'default' : 'outline'"
        size="sm"
        role="tab"
        :aria-selected="scope === 'upcoming'"
        @click="setScope('upcoming')"
      >
        Akan datang
      </Button>
      <Button
        :variant="scope === 'past' ? 'default' : 'outline'"
        size="sm"
        role="tab"
        :aria-selected="scope === 'past'"
        @click="setScope('past')"
      >
        Sudah berlangsung
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
      Agenda sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.
    </div>

    <div
      v-else-if="store.publicEntries.length === 0"
      class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
    >
      <template v-if="scope === 'upcoming'">
        Belum ada kegiatan yang dijadwalkan.
      </template>
      <template v-else> Belum ada kegiatan yang tercatat. </template>
    </div>

    <div
      v-else
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <AgendaCard
        v-for="entry in store.publicEntries"
        :key="entry.id"
        :entry="entry"
      />
    </div>

    <PagePagination
      v-if="!store.loading && !store.unavailable"
      :page="page"
      :total="store.publicTotal"
      :limit="store.publicLimit"
    />
  </div>
</template>
