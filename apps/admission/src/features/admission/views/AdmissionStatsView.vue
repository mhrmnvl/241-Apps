<script setup lang="ts">
import { onMounted } from 'vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { useAdmissionStats } from '../composables/useAdmissionStats'
import { STATUS_LABELS } from '../types'
import type { AdmissionStatus } from '../types'

const { stats, loading, fetchStats } = useAdmissionStats()

const STATUS_ORDER: AdmissionStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'REVISION_NEEDED',
  'VERIFIED',
  'ACCEPTED',
  'REJECTED',
  'ENROLLED',
]

onMounted(() => {
  void fetchStats()
})
</script>

<template>
  <div
    v-if="loading"
    class="p-6 text-sm text-muted-foreground"
  >
    Memuat statistik…
  </div>

  <div
    v-else-if="stats"
    class="space-y-6 p-4 sm:p-6"
  >
    <div>
      <h1 class="text-xl font-semibold">Dashboard Penerimaan Santri Baru</h1>
      <p class="text-sm text-muted-foreground">
        Total {{ stats.total }} pendaftar di semua gelombang.
      </p>
    </div>

    <!-- Per status -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        v-for="status in STATUS_ORDER"
        :key="status"
      >
        <CardHeader class="pb-2">
          <CardDescription>{{ STATUS_LABELS[status] }}</CardDescription>
          <CardTitle class="text-3xl">
            {{ stats.byStatus[status] ?? 0 }}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>

    <!-- Per gelombang -->
    <Card>
      <CardHeader>
        <CardTitle>Keterisian Kuota per Gelombang</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          v-if="stats.waves.length === 0"
          class="text-sm text-muted-foreground"
        >
          Belum ada gelombang.
        </p>
        <ul
          v-else
          class="space-y-4"
        >
          <li
            v-for="wave in stats.waves"
            :key="wave.id"
          >
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="font-medium">
                {{ wave.name }}
                <span class="text-muted-foreground">({{ wave.code }})</span>
              </span>
              <span>{{ wave.accepted }} / {{ wave.quota }} diterima</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary"
                :style="{
                  width: `${Math.min(wave.quotaFillRate * 100, 100)}%`,
                }"
              />
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
