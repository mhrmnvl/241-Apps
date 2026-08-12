<script setup lang="ts">
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { createWorkPatternColumns } from '../components/workPatternColumns'
import WorkPatternFormDialog from '../components/WorkPatternFormDialog.vue'
import {
  loading,
  patterns,
  workPatternService,
} from '../services/workPatternService'
import type { WorkPattern } from '../types'

const showForm = ref(false)
const editing = ref<WorkPattern | null>(null)

function startNew() {
  editing.value = null
  showForm.value = true
}

function startEdit(pattern: WorkPattern) {
  editing.value = pattern
  showForm.value = true
}

async function remove(pattern: WorkPattern) {
  const confirmed = window.confirm(`Hapus pola kerja "${pattern.name}"?`)
  if (confirmed) {
    await workPatternService.deletePattern(pattern.id)
    await workPatternService.fetchPatterns()
  }
}

const tableColumns = computed(() =>
  createWorkPatternColumns(startEdit, (pattern) => void remove(pattern)),
)

onMounted(() => void workPatternService.fetchPatterns())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Pola Kerja
        </CardTitle>
        <Button @click="startNew">
          <Plus class="mr-2 h-4 w-4" />
          Pola Baru
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <DataTable
          :columns="tableColumns"
          :data="patterns"
          :is-loading="loading"
          item-label="pola kerja"
        />

        <WorkPatternFormDialog
          v-model:open="showForm"
          :editing="editing"
          @success="workPatternService.fetchPatterns()"
        />
      </div>
    </Card>
  </div>
</template>
