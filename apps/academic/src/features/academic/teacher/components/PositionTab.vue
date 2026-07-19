<script setup lang="ts">
import { computed } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTable } from '@/ui'
import { useTeacher } from '../composables/useTeacher'
import { createPositionColumns } from './positionColumns'
import type { TeacherPosition } from '../types'

const props = defineProps<{
  data: { positions?: TeacherPosition[] }
  teacherId?: string
  isAdmin?: boolean
}>()
const emit = defineEmits<{ edit: [item: TeacherPosition]; reload: [] }>()

const { deletePosition } = useTeacher()

const columns = computed(() => {
  return createPositionColumns(props.isAdmin || false, {
    onEdit: (item) => emit('edit', item),
    onDelete: (id, setLoading, closeAlert) => {
      void (async () => {
        setLoading(true)
        const { success } = await deletePosition(props.teacherId!, id)
        if (success) {
          emit('reload')
          closeAlert()
        } else {
          setLoading(false)
        }
      })()
    },
  })
})

const tableData = computed(() => props.data?.positions ?? [])
</script>

<template>
  <div class="py-4">
    <div v-if="tableData && tableData.length > 0">
      <DataTable
        :columns="columns as ColumnDef<TeacherPosition>[]"
        :data="tableData"
        :total-items="tableData.length"
        item-label="jabatan"
        :hide-per-page="true"
        :hide-pagination="true"
      />
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">
        Belum ada catatan jabatan yang ditambahkan.
      </p>
    </div>
  </div>
</template>
