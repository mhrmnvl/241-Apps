<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Plus } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/features/platform/auth'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { timeSlotApi } from '../api/timeSlotApi'
import { createTimeSlotTypeColumns } from '../components/timeSlotTypeColumns'
import TimeSlotTypeFormDialog from '../components/TimeSlotTypeFormDialog.vue'
import type { TimeSlotType } from '../types'

const breadcrumbs = [
  { title: 'Referensi', href: '#' },
  { title: 'Tipe Jam', href: '/setting/time-slot-type' },
]

const { can } = useRoleGuard()

const data = ref<TimeSlotType[]>([])
const isLoading = ref(false)
const isAddOpen = ref(false)
const isEditOpen = ref(false)
const selectedItem = ref<TimeSlotType | null>(null)

async function fetchTypes() {
  isLoading.value = true
  try {
    const res = await timeSlotApi.getTimeSlotTypes()
    data.value = res.data.data ?? []
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat tipe jam.'))
  } finally {
    isLoading.value = false
  }
}

function openEdit(item: TimeSlotType) {
  selectedItem.value = { ...item }
  isEditOpen.value = true
}

async function handleDelete(
  item: TimeSlotType,
  callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
) {
  callbacks.setLoading(true)
  try {
    await timeSlotApi.deleteTimeSlotType(item.id)
    toast.success('Tipe jam berhasil dihapus')
    callbacks.closeAlert()
    await fetchTypes()
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus tipe jam.'))
  } finally {
    callbacks.setLoading(false)
  }
}

const columns = createTimeSlotTypeColumns(
  openEdit,
  (item, callbacks) => {
    void handleDelete(item, callbacks)
  },
  can('time-slots.update') || can('time-slots.delete'),
)

onMounted(fetchTypes)
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tipe Jam
          </CardTitle>
          <Button
            v-if="can('time-slots.create')"
            class="w-full sm:w-auto"
            @click="isAddOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah Tipe
          </Button>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="data"
            :is-loading="isLoading"
            item-label="tipe jam"
            filter-column="name"
            filter-placeholder="Cari tipe jam..."
          />
        </div>
      </Card>

      <TimeSlotTypeFormDialog
        v-if="can('time-slots.create')"
        v-model:open="isAddOpen"
        @success="fetchTypes"
      />

      <TimeSlotTypeFormDialog
        v-if="can('time-slots.update')"
        v-model:open="isEditOpen"
        :initial-data="selectedItem"
        @success="fetchTypes"
      />
    </div>
  </AppLayout>
</template>
