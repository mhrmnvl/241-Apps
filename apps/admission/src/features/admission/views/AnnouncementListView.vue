<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import AnnouncementFormSheet from '../components/AnnouncementFormSheet.vue'
import type {
  AdmissionAnnouncement,
  AdmissionWaveSummary,
  AnnouncementSavePayload,
} from '../types'
import { formatDateTime } from '../utils'

const announcements = ref<AdmissionAnnouncement[]>([])
const waves = ref<AdmissionWaveSummary[]>([])
const loading = ref(false)
const isSaving = ref(false)
const isFormOpen = ref(false)
const selected = ref<AdmissionAnnouncement | null>(null)

const breadcrumbs = [
  { title: 'Admin PSB', href: '/admin' },
  { title: 'Pengumuman' },
]

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
              onClick: () => publish(row.original.id),
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
        onDelete: () => remove(row.original.id),
      }),
    enableSorting: false,
  },
])

async function fetchData() {
  loading.value = true
  try {
    const [annRes, waveRes] = await Promise.all([
      admissionApi.getManageAnnouncements({ limit: 100 }),
      admissionApi.getWaves({ limit: 100 }),
    ])
    announcements.value = annRes.data.data ?? []
    waves.value = waveRes.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat pengumuman.'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openCreateForm() {
  selected.value = null
  isFormOpen.value = true
}

function openEditForm(announcement: AdmissionAnnouncement) {
  selected.value = announcement
  isFormOpen.value = true
}

async function save(payload: AnnouncementSavePayload) {
  isSaving.value = true
  try {
    if (selected.value) {
      await admissionApi.updateAnnouncement(selected.value.id, payload)
      toast.success('Pengumuman diperbarui.')
    } else {
      await admissionApi.createAnnouncement(payload)
      toast.success('Pengumuman dibuat (draft).')
    }
    isFormOpen.value = false
    await fetchData()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menyimpan pengumuman.'))
  } finally {
    isSaving.value = false
  }
}

async function publish(id: string) {
  if (
    !window.confirm(
      'Terbitkan pengumuman ini? Semua pendaftar dalam cakupan akan menerima notifikasi.',
    )
  ) {
    return
  }
  try {
    await admissionApi.publishAnnouncement(id)
    toast.success('Pengumuman diterbitkan dan notifikasi dikirim.')
    await fetchData()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menerbitkan pengumuman.'))
  }
}

async function remove(id: string) {
  if (!window.confirm('Hapus pengumuman ini?')) return
  try {
    await admissionApi.deleteAnnouncement(id)
    toast.success('Pengumuman dihapus.')
    await fetchData()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus pengumuman.'))
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
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
        @save="save"
      />
    </div>
  </AppLayout>
</template>
