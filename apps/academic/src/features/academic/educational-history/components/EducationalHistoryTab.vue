<script setup lang="ts">
import { computed } from 'vue'
import { DataTable } from '@/ui'
import { useEducationalHistory } from '../composables/useEducationalHistory'
import { createEducationalHistoryColumns } from './columns'
import type { EducationalHistoryTabData, EducationalHistory } from '../types'

const props = defineProps<{
  data: EducationalHistoryTabData
  isAdmin?: boolean
}>()
const emit = defineEmits<{ edit: [item: EducationalHistory]; reload: [] }>()

const { deleteEducationalHistory } = useEducationalHistory()

const isStudent = computed(() => Boolean(props.data.roles?.includes('STUDENT')))

const columns = computed(() => {
  return createEducationalHistoryColumns(
    isStudent.value,
    props.isAdmin || false,
    {
      onEdit: (item) => emit('edit', item),
      onDelete: (id, setLoading, closeAlert) => {
        void (async () => {
          setLoading(true)
          const { success } = await deleteEducationalHistory(id)
          if (success) {
            emit('reload')
            closeAlert()
          } else {
            setLoading(false)
          }
        })()
      },
    },
  )
})

const tableData = computed(() =>
  isStudent.value
    ? (props.data.studentHistory ?? [])
    : (props.data.educationHistory ?? []),
)
const itemLabel = computed(() =>
  isStudent.value ? 'riwayat belajar' : 'riwayat pendidikan',
)
</script>

<template>
  <div class="py-4">
    <div v-if="tableData && tableData.length > 0">
      <DataTable
        :columns="columns"
        :data="tableData"
        :total-items="tableData.length"
        :item-label="itemLabel"
        :hide-per-page="true"
        :hide-pagination="true"
      />
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">
        Belum ada catatan {{ itemLabel }} yang ditambahkan.
      </p>
    </div>
  </div>
</template>
