<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AcademicCalendarTableView from '../components/AcademicCalendarTableView.vue'
import { useAcademicCalendarManageView } from '../composables/useAcademicCalendarManageView'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import type { CalendarEventData } from '../types'

const router = useRouter()

const {
  tableEvents,
  tableLoading,
  isDeletingBulk,
  fetchTableEvents,
  onUpdateFilters,
  tableViewRef,
  handleDeleteBulk,
  handleSavedOrDeleted,
} = useAcademicCalendarManageView()

function navigateToCreate() {
  void router.push({ name: 'academic-calendar-create' })
}

function navigateToEdit(eventObj: CalendarEventData) {
  void router.push({
    name: 'academic-calendar-edit',
    params: { id: eventObj.id },
    state: { eventData: { ...eventObj } },
  })
}

onMounted(() => {
  void tableViewRef
  void fetchTableEvents()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Manajemen Kalender
          </CardTitle>
        </div>
        <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <Button
            class="w-full sm:w-auto"
            @click="navigateToCreate"
          >
            <Plus class="size-4 mr-2" />
            Tambah Agenda
          </Button>
        </div>
      </CardHeader>

      <AcademicCalendarTableView
        ref="tableViewRef"
        :table-events="tableEvents"
        :is-loading="tableLoading"
        :is-deleting-bulk="isDeletingBulk"
        :show-actions="true"
        @update-filters="onUpdateFilters"
        @delete-bulk="handleDeleteBulk"
        @edit="navigateToEdit"
        @deleted="handleSavedOrDeleted"
      />
    </Card>
  </div>
</template>
