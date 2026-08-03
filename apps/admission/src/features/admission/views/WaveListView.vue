<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { useWaveList } from '../composables/useWaveList'
import WaveFormSheet from '../components/WaveFormSheet.vue'
import type { AdmissionWaveSummary, WaveSavePayload } from '../types'
import { formatDate, formatIDR } from '../utils'

const {
  waves,
  academicYears,
  loading,
  isSaving,
  fetchWaves,
  fetchAcademicYears,
  saveWave,
  deleteWave,
} = useWaveList()

const isFormOpen = ref(false)
const selectedWave = ref<AdmissionWaveSummary | null>(null)

const columns = computed<ColumnDef<AdmissionWaveSummary>[]>(() => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  { accessorKey: 'code', header: 'Kode' },
  { accessorKey: 'name', header: 'Nama' },
  {
    id: 'period',
    header: 'Periode',
    cell: ({ row }) =>
      `${formatDate(row.original.startDate)} — ${formatDate(row.original.endDate)}`,
  },
  {
    id: 'quota',
    header: 'Kuota',
    cell: ({ row }) =>
      `${row.original._count?.applications ?? 0} / ${row.original.quota}`,
  },
  {
    id: 'fee',
    header: 'Biaya',
    cell: ({ row }) => formatIDR(Number(row.original.registrationFee)),
  },
  {
    id: 'isActive',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isActive ? 'default' : 'secondary' },
        () => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
      ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) =>
      h(ActionCell, {
        onEdit: () => openEditForm(row.original),
        onDelete: () => handleDelete(row.original.id),
      }),
    enableSorting: false,
  },
])

onMounted(() => {
  void fetchWaves()
  void fetchAcademicYears()
})

function openCreateForm() {
  selectedWave.value = null
  isFormOpen.value = true
}

function openEditForm(wave: AdmissionWaveSummary) {
  selectedWave.value = wave
  isFormOpen.value = true
}

async function handleSave(payload: WaveSavePayload) {
  const result = await saveWave(selectedWave.value?.id ?? null, payload)
  if (result.success) {
    isFormOpen.value = false
    await fetchWaves()
  }
}

async function handleDelete(id: string) {
  if (!window.confirm('Hapus gelombang ini?')) return
  const result = await deleteWave(id)
  if (result.success) {
    await fetchWaves()
  }
}
</script>

<template>
  <div class="p-4 sm:p-6">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <CardTitle class="text-xl font-bold tracking-tight">
          Gelombang Pendaftaran
        </CardTitle>
        <Button @click="openCreateForm">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Gelombang
        </Button>
      </CardHeader>

      <div class="p-6">
        <DataTable
          :columns="columns"
          :data="waves"
          :is-loading="loading"
          item-label="gelombang"
        />
      </div>
    </Card>

    <WaveFormSheet
      v-model:open="isFormOpen"
      :wave="selectedWave"
      :is-saving="isSaving"
      :academic-years="academicYears"
      @save="handleSave"
    />
  </div>
</template>
