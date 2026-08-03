<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { useAnnouncementList } from '../composables/useAnnouncementList'
import AnnouncementFormSheet from '../components/AnnouncementFormSheet.vue'
import type { AdmissionAnnouncement, AnnouncementSavePayload } from '../types'
import { formatDateTime } from '../utils'

const {
  announcements,
  waves,
  loading,
  isSaving,
  fetchData,
  saveAnnouncement,
  publishAnnouncement,
  deleteAnnouncement,
} = useAnnouncementList()

const isFormOpen = ref(false)
const selected = ref<AdmissionAnnouncement | null>(null)

const columns = computed<ColumnDef<AdmissionAnnouncement>[]>(() => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  { accessorKey: 'title', header: 'Judul' },
  {
    id: 'wave',
    header: 'Gelombang',
    cell: ({ row }) => row.original.wave?.name ?? 'Semua',
  },
  {
    id: 'isPublished',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isPublished ? 'default' : 'secondary' },
        () => (row.original.isPublished ? 'Terbit' : 'Draft'),
      ),
  },
  {
    id: 'publishedAt',
    header: 'Terbit',
    cell: ({ row }) => formatDateTime(row.original.publishedAt),
  },
  {
    id: 'publish',
    header: 'Publikasi',
    cell: ({ row }) =>
      row.original.isPublished
        ? '-'
        : h(
            Button,
            {
              size: 'sm',
              variant: 'outline',
              onClick: () => handlePublish(row.original.id),
            },
            () => 'Terbitkan',
          ),
    enableSorting: false,
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

onMounted(fetchData)

function openCreateForm() {
  selected.value = null
  isFormOpen.value = true
}

function openEditForm(announcement: AdmissionAnnouncement) {
  selected.value = announcement
  isFormOpen.value = true
}

async function handleSave(payload: AnnouncementSavePayload) {
  const result = await saveAnnouncement(selected.value?.id ?? null, payload)
  if (result.success) {
    isFormOpen.value = false
    await fetchData()
  }
}

async function handlePublish(id: string) {
  if (
    !window.confirm(
      'Terbitkan pengumuman ini? Semua pendaftar dalam cakupan akan menerima notifikasi.',
    )
  ) {
    return
  }
  const result = await publishAnnouncement(id)
  if (result.success) {
    await fetchData()
  }
}

async function handleDelete(id: string) {
  if (!window.confirm('Hapus pengumuman ini?')) return
  const result = await deleteAnnouncement(id)
  if (result.success) {
    await fetchData()
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
          Pengumuman PSB
        </CardTitle>
        <Button @click="openCreateForm">
          <Plus class="mr-2 h-4 w-4" />
          Buat Pengumuman
        </Button>
      </CardHeader>

      <div class="p-6">
        <DataTable
          :columns="columns"
          :data="announcements"
          :is-loading="loading"
          item-label="pengumuman"
        />
      </div>
    </Card>

    <AnnouncementFormSheet
      v-model:open="isFormOpen"
      :announcement="selected"
      :is-saving="isSaving"
      :waves="waves"
      @save="handleSave"
    />
  </div>
</template>
