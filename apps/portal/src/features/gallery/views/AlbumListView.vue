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
import { galleryService } from '../services/galleryService'
import { useGalleryStore } from '../stores/galleryStore'
import type { GalleryAlbum } from '../types'

const router = useRouter()
const store = useGalleryStore()

onMounted(() => void galleryService.fetchList())

function openEdit(id: string) {
  void router.push({ name: 'admin-album-edit', params: { id } })
}

async function togglePublished(album: GalleryAlbum) {
  await galleryService.setPublished(
    album.id,
    album.version,
    album.status !== 'PUBLISHED',
  )
}

async function remove(album: GalleryAlbum) {
  if (!window.confirm(`Hapus album "${album.title}"?`)) return
  await galleryService.remove(album.id)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

const columns: ColumnDef<GalleryAlbum>[] = [
  {
    accessorKey: 'title',
    header: 'Album',
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
    accessorKey: 'eventDate',
    header: 'Tanggal kegiatan',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        formatDate(row.original.eventDate),
      ),
  },
  {
    accessorKey: 'photoCount',
    header: 'Foto',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        row.original.photoCount ?? 0,
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const album = row.original
      return h(
        Badge,
        { variant: album.status === 'PUBLISHED' ? 'default' : 'outline' },
        () => CONTENT_STATUS_LABELS[album.status],
      )
    },
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Tindakan'),
    cell: ({ row }) => {
      const album = row.original
      return h('div', { class: 'flex justify-end gap-1' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: album.status === 'PUBLISHED' ? 'Tarik' : 'Terbitkan',
            disabled: store.isSaving,
            onClick: (e: Event) => {
              e.stopPropagation()
              void togglePublished(album)
            },
          },
          () =>
            h(album.status === 'PUBLISHED' ? EyeOff : Eye, { class: 'size-4' }),
        ),
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: 'Hapus',
            onClick: (e: Event) => {
              e.stopPropagation()
              void remove(album)
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
            >Galeri</CardTitle
          >
        </div>
        <Button
          class="w-full sm:w-auto"
          @click="router.push({ name: 'admin-album-baru' })"
        >
          <Plus class="mr-2 h-4 w-4" />
          Album baru
        </Button>
      </CardHeader>

      <div class="p-6">
        <DataTable
          :columns="columns"
          :data="store.albums"
          :is-loading="store.loading"
          item-label="album"
          filter-column="title"
          filter-placeholder="Cari album..."
        />
      </div>
    </Card>
  </div>
</template>
