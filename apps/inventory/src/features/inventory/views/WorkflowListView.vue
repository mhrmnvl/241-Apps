<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Badge } from '@/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Shield, ArrowRight } from 'lucide-vue-next'
import type { ApprovalWorkflow } from '../types'
import { approvalService } from '../services/approvalService'

// State
const workflows = ref<ApprovalWorkflow[]>([])
const loading = ref(false)

async function loadWorkflows() {
  loading.value = true
  workflows.value = await approvalService.listWorkflows()
  loading.value = false
}

onMounted(() => {
  void loadWorkflows()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="border-b px-6 py-5">
        <CardTitle class="text-2xl font-bold tracking-tight"
          >Alur Kerja Persetujuan (Workflow)</CardTitle
        >
        <p class="text-sm text-muted-foreground mt-1">
          Konfigurasi persetujuan berjenjang untuk peminjaman aset logistik
          sekolah.
        </p>
      </CardHeader>
      <CardContent class="p-6">
        <div
          v-if="loading"
          class="text-center text-sm text-muted-foreground py-8"
        >
          Memuat alur kerja...
        </div>

        <div
          v-else
          class="grid gap-6 md:grid-cols-2"
        >
          <Card
            v-for="wf in workflows"
            :key="wf.id"
            class="border shadow-none rounded-xl overflow-hidden bg-card"
          >
            <div class="p-5 border-b flex items-center justify-between">
              <div>
                <h3 class="font-bold text-lg text-foreground">
                  {{ wf.name }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Entity Target:
                  <span
                    class="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded"
                    >{{ wf.targetEntity }}</span
                  >
                </p>
              </div>
              <Badge :variant="wf.isActive ? 'default' : 'outline'">
                {{ wf.isActive ? 'Aktif' : 'Nonaktif' }}
              </Badge>
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-muted-foreground">
                {{ wf.description ?? 'Tidak ada deskripsi.' }}
              </p>

              <div class="space-y-2 pt-2 border-t">
                <h4
                  class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Tahapan Persetujuan
                </h4>

                <div class="flex flex-wrap items-center gap-2 py-1">
                  <template
                    v-for="(step, idx) in wf.steps"
                    :key="step.id"
                  >
                    <!-- Step badge -->
                    <div
                      class="flex items-center space-x-1.5 border px-3 py-1.5 rounded-lg bg-background text-sm font-medium"
                    >
                      <Shield class="size-4 text-primary" />
                      <span>{{ step.approverRoleId }}</span>
                    </div>

                    <!-- Connector arrow -->
                    <ArrowRight
                      v-if="Number(idx) < wf.steps.length - 1"
                      class="size-4 text-muted-foreground shrink-0"
                    />
                  </template>
                </div>
              </div>
            </div>
          </Card>

          <div
            v-if="workflows.length === 0"
            class="col-span-2 text-center text-sm text-muted-foreground py-12"
          >
            Belum ada alur persetujuan yang terkonfigurasi.
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
