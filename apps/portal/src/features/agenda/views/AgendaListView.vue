<script setup lang="ts">
import { h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTable } from '@/ui'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-vue-next'
import { CONTENT_STATUS_LABELS } from '@/features/post'
import { agendaService } from '../services/agendaService'
import { useAgendaStore } from '../stores/agendaStore'
import type { AgendaEntry } from '../types'

const router = useRouter()
const store = useAgendaStore()

onMounted(() => void agendaService.fetchList())

function openNew() {
  void router.push({ name: 'admin-agenda-baru' })
}

function openEdit(id: string) {
  void router.push({ name: 'admin-agenda-edit', params: { id } })
}

async function togglePublished(entry: AgendaEntry) {
  await agendaService.setPublished(
    entry.id,
    entry.version,
    entry.status !== 'PUBLISHED',
  )
}

async function remove(entry: AgendaEntry) {
  if (!window.confirm(`Hapus agenda "${entry.title}"?`)) return
  await agendaService.remove(entry.id)
}

function formatRange(entry: AgendaEntry) {
  const format = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })
  return `${format.format(new Date(entry.startTime))} – ${format.format(new Date(entry.endTime))}`
}

const columns: ColumnDef<AgendaEntry>[] = [
  {
    accessorKey: 'title',
    header: 'Kegiatan',
    cell: ({ row }) =>
      h(
        'button',
        {
          class: 'font-medium text-left hover:underline cursor-pointer',
          onClick: () => openEdit(row.original.id),
        },
        row.original.title,
      ),
  },
  {
    id: 'startTime',
    header: 'Waktu',
    cell: ({ row }) =>
      h('span', { class: 'text-muted-foreground' }, formatRange(row.original)),
  },
  {
    accessorKey: 'location',
    header: 'Lokasi',
    cell: ({ row }) =>
      h('span', { class: 'text-muted-foreground' }, row.original.location),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const entry = row.original
      return h(
        Badge,
        { variant: entry.status === 'PUBLISHED' ? 'default' : 'outline' },
        () => CONTENT_STATUS_LABELS[entry.status],
      )
    },
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Tindakan'),
    cell: ({ row }) => {
      const entry = row.original
      return h('div', { class: 'flex justify-end gap-1' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: entry.status === 'PUBLISHED' ? 'Tarik' : 'Terbitkan',
            disabled: store.isSaving,
            onClick: (e: Event) => {
              e.stopPropagation()
              void togglePublished(entry)
            },
          },
          () =>
            h(entry.status === 'PUBLISHED' ? EyeOff : Eye, { class: 'size-4' }),
        ),
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: 'Hapus',
            onClick: (e: Event) => {
              e.stopPropagation()
              void remove(entry)
            },
          },
          () => h(Trash2, { class: 'size-4' }),
        ),
      ])
    },
  },
]
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
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Agenda</CardTitle
          >
        </div>
        <Button
          class="w-full sm:w-auto"
          @click="openNew"
        >
          <Plus class="mr-2 h-4 w-4" />
          Agenda baru
        </Button>
      </CardHeader>

      <div class="p-6">
        <DataTable
          :columns="columns"
          :data="store.entries"
          :is-loading="store.loading"
          item-label="agenda"
          filter-column="title"
          filter-placeholder="Cari kegiatan..."
        />
      </div>
    </Card>
  </div>
</template>
