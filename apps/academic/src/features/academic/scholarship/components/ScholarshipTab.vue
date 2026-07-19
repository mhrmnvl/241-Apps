<script setup lang="ts">
import { computed } from 'vue'
import { DataTable } from '@/ui'
import { useScholarship } from '../composables/useScholarship'
import { createScholarshipColumns } from './columns'
import type { ScholarshipTabData, Scholarship } from '../types'

const props = defineProps<{ data: ScholarshipTabData; isAdmin?: boolean }>()
const emit = defineEmits<{ edit: [item: Scholarship]; reload: [] }>()

const { deleteScholarship } = useScholarship()

const columns = computed(() => {
  return createScholarshipColumns(props.isAdmin || false, {
    onEdit: (item) => emit('edit', item),
    onDelete: (id, setLoading, closeAlert) => {
      void (async () => {
        setLoading(true)
        const { success } = await deleteScholarship(id)
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
</script>

<template>
  <div class="py-4">
    <div v-if="data.scholarships && data.scholarships.length > 0">
      <DataTable
        :columns="columns"
        :data="data.scholarships"
        :total-items="data.scholarships.length"
        item-label="beasiswa"
        :hide-per-page="true"
        :hide-pagination="true"
      />
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">
        Belum ada catatan beasiswa yang diterima.
      </p>
    </div>
  </div>
</template>
