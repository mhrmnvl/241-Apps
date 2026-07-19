<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import type { AdmissionAnnouncement, AdmissionWaveSummary } from '../types'
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

const form = ref({
  title: '',
  content: '',
  waveId: 'ALL',
})

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
  form.value = { title: '', content: '', waveId: 'ALL' }
  isFormOpen.value = true
}

function openEditForm(announcement: AdmissionAnnouncement) {
  selected.value = announcement
  form.value = {
    title: announcement.title,
    content: announcement.content,
    waveId: announcement.waveId ?? 'ALL',
  }
  isFormOpen.value = true
}

async function save() {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    toast.error('Judul dan isi pengumuman wajib diisi.')
    return
  }
  isSaving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      waveId: form.value.waveId === 'ALL' ? undefined : form.value.waveId,
    }
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
    <div class="space-y-4 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Pengumuman PSB</CardTitle>
            <Button @click="openCreateForm">
              <Plus class="mr-1 h-4 w-4" />
              Buat Pengumuman
            </Button>
          </div>
        </CardHeader>
      </Card>

      <DataTable
        :columns="columns"
        :data="announcements"
        :loading="loading"
      />

      <Sheet v-model:open="isFormOpen">
        <SheetContent class="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {{ selected ? 'Ubah Pengumuman' : 'Buat Pengumuman' }}
            </SheetTitle>
            <SheetDescription>
              Pengumuman tampil di dashboard pendaftar setelah diterbitkan.
            </SheetDescription>
          </SheetHeader>

          <div class="space-y-4 px-4 py-4">
            <div class="space-y-2">
              <Label>Judul</Label>
              <Input v-model="form.title" />
            </div>
            <div class="space-y-2">
              <Label>Isi</Label>
              <Textarea
                v-model="form.content"
                rows="6"
              />
            </div>
            <div class="space-y-2">
              <Label>Gelombang</Label>
              <Select v-model="form.waveId">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Gelombang</SelectItem>
                  <SelectItem
                    v-for="wave in waves"
                    :key="wave.id"
                    :value="wave.id"
                  >
                    {{ wave.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button
              :disabled="isSaving"
              @click="save"
            >
              {{ isSaving ? 'Menyimpan…' : 'Simpan' }}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </AppLayout>
</template>
