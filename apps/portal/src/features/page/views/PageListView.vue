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
import { pageService } from '../services/pageService'
import { usePageStore } from '../stores/pageStore'
import type { PortalPage } from '../types'

const router = useRouter()
const store = usePageStore()

onMounted(() => void pageService.fetchList())

function openNew() {
  void router.push({ name: 'admin-halaman-baru' })
}

function openEdit(id: string) {
  void router.push({ name: 'admin-halaman-edit', params: { id } })
}

async function togglePublished(page: PortalPage) {
  await pageService.setPublished(
    page.id,
    page.version,
    page.status !== 'PUBLISHED',
  )
}

async function remove(page: PortalPage) {
  const confirmed = window.confirm(
    `Hapus halaman "${page.title}"? Menu yang menautnya akan berhenti bekerja.`,
  )
  if (!confirmed) return
  await pageService.remove(page.id)
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

const columns: ColumnDef<PortalPage>[] = [
  {
    accessorKey: 'title',
    header: 'Judul',
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
    accessorKey: 'slug',
    header: 'Alamat',
    cell: ({ row }) =>
      h('span', { class: 'text-muted-foreground' }, `/${row.original.slug}`),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const page = row.original
      return h(
        Badge,
        { variant: page.status === 'PUBLISHED' ? 'default' : 'outline' },
        () => CONTENT_STATUS_LABELS[page.status],
      )
    },
  },
  {
    accessorKey: 'publishedAt',
    header: 'Terbit',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        formatDate(row.original.publishedAt),
      ),
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Tindakan'),
    cell: ({ row }) => {
      const page = row.original
      return h('div', { class: 'flex justify-end gap-1' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title:
              page.status === 'PUBLISHED'
                ? 'Tarik dari publikasi'
                : 'Terbitkan',
            disabled: store.isSaving,
            onClick: (e: Event) => {
              e.stopPropagation()
              void togglePublished(page)
            },
          },
          () =>
            h(page.status === 'PUBLISHED' ? EyeOff : Eye, { class: 'size-4' }),
        ),
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: 'Hapus',
            onClick: (e: Event) => {
              e.stopPropagation()
              void remove(page)
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
            >Halaman</CardTitle
          >
        </div>
        <Button
          class="w-full sm:w-auto"
          @click="openNew"
        >
          <Plus class="mr-2 h-4 w-4" />
          Halaman baru
        </Button>
      </CardHeader>

      <div class="p-6">
        <DataTable
          :columns="columns"
          :data="store.pages"
          :is-loading="store.loading"
          item-label="halaman"
          filter-column="title"
          filter-placeholder="Cari halaman..."
        />
      </div>
    </Card>
  </div>
</template>
