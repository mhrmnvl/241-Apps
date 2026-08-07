<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/ui/button'

/**
 * Page controls for every public listing (FR-021, US2 scenario 2).
 *
 * The page number lives in the address rather than in component state, so this
 * pushes a route instead of emitting: page 3 has to be linkable, bookmarkable,
 * and survive a reload. Existing query keys are preserved, which is what keeps
 * a filtered or scoped listing on its filter when the visitor pages through it.
 *
 * Cross-feature and single-app, so it stays in `apps/portal` (constitution II);
 * it moves to `packages/*` only if a second app ever needs it.
 */
const props = defineProps<{
  page: number
  total: number
  limit: number
}>()

const route = useRoute()
const router = useRouter()

const totalPages = computed(() =>
  props.limit > 0 ? Math.ceil(props.total / props.limit) : 1,
)

function goTo(next: number) {
  if (next < 1 || next > totalPages.value) return
  void router.push({ query: { ...route.query, page: String(next) } })
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-4"
    aria-label="Navigasi halaman"
  >
    <Button
      variant="outline"
      size="sm"
      :disabled="page <= 1"
      @click="goTo(page - 1)"
    >
      Sebelumnya
    </Button>
    <span class="text-sm text-muted-foreground">
      Halaman {{ page }} dari {{ totalPages }}
    </span>
    <Button
      variant="outline"
      size="sm"
      :disabled="page >= totalPages"
      @click="goTo(page + 1)"
    >
      Berikutnya
    </Button>
  </nav>
</template>
