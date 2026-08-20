<script setup lang="ts">
import type { CalendarEventData, FilterPayload } from '../types'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import type { Table } from '@tanstack/vue-table'
import { Trash } from 'lucide-vue-next'
import { ref } from 'vue'
import { createCalendarColumns } from './columns'

const props = defineProps<{
  tableEvents?: CalendarEventData[]
  isLoading?: boolean
  isDeletingBulk?: boolean
  showActions?: boolean
}>()

const emit = defineEmits<{
  'update-filters': [val: FilterPayload]
  'delete-bulk': [ids: string[]]
  edit: [eventObj: CalendarEventData]
  deleted: []
}>()

const dataTableRef = ref<{ table: Table<CalendarEventData> } | null>(null)
const selectedRows = ref<CalendarEventData[]>([])

const handleSelectionChange = (rows: CalendarEventData[]) => {
  selectedRows.value = rows
}

const clearSelection = () => {
  if (dataTableRef.value?.table) {
    dataTableRef.value.table.toggleAllRowsSelected(false)
  }
}

defineExpose({ clearSelection })

const columns = createCalendarColumns({
  onEdit: (item) => emit('edit', item),
  onDelete: (item, { closeAlert }) => {
    emit('delete-bulk', [item.id])
    closeAlert()
  },
  showActions: props.showActions,
})

const deleteSelected = () => {
  const ids = selectedRows.value.map((r) => r.id)
  emit('delete-bulk', ids)
}
</script>

<template>
  <div class="space-y-4 p-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div
        v-if="selectedRows.length > 0"
        class="flex items-center gap-2"
      >
        <span class="text-sm text-muted-foreground"
          >{{ selectedRows.length }} baris dipilih</span
        >
        <Button
          variant="destructive"
          size="sm"
          :disabled="isDeletingBulk"
          @click="deleteSelected"
        >
          <Trash class="w-4 h-4 mr-2" />
          {{ isDeletingBulk ? 'Menghapus...' : 'Hapus Terpilih' }}
        </Button>
      </div>
      <div v-else />
    </div>

    <DataTable
      ref="dataTableRef"
      :columns="columns"
      :data="tableEvents || []"
      :is-loading="isLoading"
      item-label="agenda kalender"
      filter-column="title"
      filter-placeholder="Cari nama agenda..."
      @selection-change="handleSelectionChange"
    />
  </div>
</template>
