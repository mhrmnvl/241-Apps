<script setup lang="ts">
import { DataTable } from '@/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { createMyRaporColumns } from '../components/myRaporColumns'
import RaporDetailDialog from '../components/RaporDetailDialog.vue'
import { raporService } from '../services/raporService'
import { useRaporStore } from '../stores/raporStore'
import type { RaporData } from '../types'

/**
 * A student's own report cards.
 */
const store = useRaporStore()
const { rapors, loading, summary } = storeToRefs(store)

const detailOpen = ref(false)
const selected = ref<RaporData | null>(null)

function openDetail(rapor: RaporData) {
  selected.value = rapor
  detailOpen.value = true
}

const tableColumns = createMyRaporColumns(openDetail)

onMounted(() => void raporService.fetchMine())
</script>

<template>
  <div class="p-4 md:p-5 lg:p-6">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Rapor Saya
        </CardTitle>

        <!-- Average score badge -->
        <div
          v-if="
            summary && summary.published > 0 && summary.averageScore !== null
          "
          class="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 border"
        >
          <span class="text-xs text-muted-foreground font-medium"
            >Rata-rata:</span
          >
          <span class="text-base font-bold tabular-nums">
            {{ summary.averageScore.toFixed(2) }}
          </span>
        </div>
      </CardHeader>

      <div class="p-6 space-y-4">
        <!-- Empty state -->
        <Card
          v-if="!loading && rapors.length === 0"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            Belum ada rapor yang diterbitkan untuk Anda. Rapor akan muncul di
            sini setelah wali kelas menerbitkannya.
          </CardContent>
        </Card>

        <!-- Data table -->
        <DataTable
          v-else
          :columns="tableColumns"
          :data="rapors"
          :is-loading="loading"
          item-label="rapor"
          hide-per-page
        />
      </div>
    </Card>

    <!-- The student's own screen, so it reads through the self-service routes. -->
    <RaporDetailDialog
      v-model:open="detailOpen"
      :rapor="selected"
      scope="own"
    />
  </div>
</template>
