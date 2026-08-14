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
 *
 * Nothing here writes. There is no generate, no publish, no delete, and no
 * export for anyone else — not disabled, absent. A greyed-out Publish button
 * would still tell a student the school is about to publish something, which
 * is not theirs to read from this screen.
 *
 * The read is `/rapors/me`, which returns published cards belonging to whoever
 * signed in. No classroom or student is chosen here, because the server
 * already knows both.
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
  <div class="space-y-6 p-4 md:p-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Rapor Saya</h1>
      <p class="text-sm text-muted-foreground">
        Rapor yang sudah diterbitkan sekolah.
      </p>
    </div>

    <Card v-if="summary && summary.published > 0">
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">
          Rata-rata keseluruhan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-2xl font-bold">
          {{
            summary.averageScore !== null
              ? summary.averageScore.toFixed(2)
              : '-'
          }}
        </p>
      </CardContent>
    </Card>

    <!--
      The empty state says which emptiness this is. "Belum ada rapor" would tell
      a student whose report card exists but is not yet published that nothing
      was ever written for them.
    -->
    <Card v-if="!loading && rapors.length === 0">
      <CardContent class="py-10 text-center text-sm text-muted-foreground">
        Belum ada rapor yang diterbitkan untuk Anda. Rapor akan muncul di sini
        setelah wali kelas menerbitkannya.
      </CardContent>
    </Card>

    <DataTable
      v-else
      :columns="tableColumns"
      :data="rapors"
      :is-loading="loading"
      hide-per-page
    />

    <RaporDetailDialog
      v-model:open="detailOpen"
      :rapor="selected"
    />
  </div>
</template>
