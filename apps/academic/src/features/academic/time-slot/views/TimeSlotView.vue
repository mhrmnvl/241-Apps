<script setup lang="ts">
import type { TimeSlot, TimeSlotSavePayload } from '../types'
import TimeSlotFormSheet from '../components/TimeSlotFormSheet.vue'
import { createTimeSlotColumns } from '../components/columns'
import { useTimeSlotList } from '../composables/useTimeSlotList'
import { useTimeSlotDelete } from '../composables/useTimeSlotDelete'
import { useTimeSlotForm } from '../composables/useTimeSlotForm'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Jam Pelajaran', href: '/pembelajaran/jam-pelajaran' },
]

const { timeSlots, totalTimeSlots, loading, fetchTimeSlots } = useTimeSlotList()
const { deleteTimeSlot } = useTimeSlotDelete()
const { isSaving, formError, saveTimeSlot } = useTimeSlotForm()

const isAddModalOpen = ref(false)
const editingItem = ref<TimeSlot | null>(null)
const { isAdmin } = useRoleGuard()

const tableColumns = createTimeSlotColumns({
  showActions: isAdmin.value,
  onEdit: (item: TimeSlot) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: TimeSlot, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteTimeSlot(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
    }
  },
})

async function handleSaveTimeSlot(payload: TimeSlotSavePayload) {
  const result = await saveTimeSlot(editingItem.value?.id ?? null, payload)
  if (result.success) {
    isAddModalOpen.value = false
  }
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

onMounted(() => {
  void fetchTimeSlots()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Jam Pelajaran
          </CardTitle>
          <Button
            v-if="isAdmin"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            :columns="tableColumns"
            :data="timeSlots"
            :total-items="totalTimeSlots"
            :is-loading="loading"
            item-label="jam pelajaran"
            filter-column="name"
            filter-placeholder="Cari jam pelajaran..."
          />

          <TimeSlotFormSheet
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :edit-data="editingItem"
            @save="handleSaveTimeSlot"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
