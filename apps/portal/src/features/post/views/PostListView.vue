<script setup lang="ts">
import { computed, h, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import {
  Archive,
  EyeOff,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-vue-next'
import { postService } from '../services/postService'
import { usePostStore } from '../stores/postStore'
import {
  CONTENT_STATUS_LABELS,
  POST_TYPE_LABELS,
  type ContentStatus,
  type PostAdminSummary,
  type PostType,
} from '../types'

const route = useRoute()
const router = useRouter()
const store = usePostStore()

const postType = computed(() => (route.meta.postType as PostType) ?? 'BERITA')

const STATUS_VARIANTS: Record<
  ContentStatus,
  'default' | 'secondary' | 'outline'
> = {
  PUBLISHED: 'default',
  SCHEDULED: 'secondary',
  DRAFT: 'outline',
  ARCHIVED: 'outline',
}

function load() {
  void postService.fetchList(postType.value)
}

onMounted(load)
watch(postType, () => {
  store.page = 1
  store.search = ''
  store.showDeleted = false
  load()
})

watch(
  () => store.showDeleted,
  () => {
    store.page = 1
    load()
  },
)

async function transition(
  post: PostAdminSummary,
  action: 'unpublish' | 'archive' | 'pin' | 'unpin',
) {
  await postService.transition(post.id, action, { version: post.version })
}

async function remove(post: PostAdminSummary) {
  const confirmed = window.confirm(
    `Hapus "${post.title}"? Konten dapat dipulihkan dalam 30 hari.`,
  )
  if (!confirmed) return
  await postService.remove(post.id)
}

async function restore(post: PostAdminSummary) {
  const restored = await postService.restore(post.id)
  if (restored) load()
}

function openNew() {
  void router.push({
    name: 'admin-post-new',
    params: { type: postType.value.toLowerCase() },
  })
}

function openEdit(id: string) {
  void router.push({ name: 'admin-post-edit', params: { id } })
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

const columns = computed<ColumnDef<PostAdminSummary>[]>(() => [
  {
    accessorKey: 'title',
    header: 'Judul',
    cell: ({ row }) => {
      const post = row.original
      return h(
        'button',
        {
          class:
            'font-medium text-left hover:underline cursor-pointer flex items-center gap-2',
          onClick: () => openEdit(post.id),
        },
        [
          post.pinnedAt
            ? h(Pin, { class: 'size-3.5 text-primary shrink-0' })
            : null,
          post.title,
        ],
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const post = row.original
      return h(
        Badge,
        { variant: STATUS_VARIANTS[post.status] },
        () => CONTENT_STATUS_LABELS[post.status],
      )
    },
  },
  {
    accessorKey: 'categoryName',
    header: 'Kategori',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground' },
        row.original.category?.name ?? '—',
      ),
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
    accessorKey: 'authorName',
    header: 'Penulis',
    cell: ({ row }) =>
      h('span', { class: 'text-muted-foreground' }, row.original.authorName),
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Tindakan'),
    cell: ({ row }) => {
      const post = row.original
      if (store.showDeleted) {
        return h('div', { class: 'flex justify-end gap-1' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'icon',
              title: 'Pulihkan',
              disabled: store.isSaving,
              onClick: (e: Event) => {
                e.stopPropagation()
                void restore(post)
              },
            },
            () => h(RotateCcw, { class: 'size-4' }),
          ),
        ])
      }

      const actions = []

      actions.push(
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: post.pinnedAt ? 'Lepas sematan' : 'Sematkan',
            disabled: store.isSaving,
            onClick: (e: Event) => {
              e.stopPropagation()
              void transition(post, post.pinnedAt ? 'unpin' : 'pin')
            },
          },
          () => h(post.pinnedAt ? PinOff : Pin, { class: 'size-4' }),
        ),
      )

      if (post.status === 'PUBLISHED' || post.status === 'SCHEDULED') {
        actions.push(
          h(
            Button,
            {
              variant: 'ghost',
              size: 'icon',
              title: 'Tarik dari publikasi',
              disabled: store.isSaving,
              onClick: (e: Event) => {
                e.stopPropagation()
                void transition(post, 'unpublish')
              },
            },
            () => h(EyeOff, { class: 'size-4' }),
          ),
        )
      }

      if (post.status !== 'ARCHIVED') {
        actions.push(
          h(
            Button,
            {
              variant: 'ghost',
              size: 'icon',
              title: 'Arsipkan',
              disabled: store.isSaving,
              onClick: (e: Event) => {
                e.stopPropagation()
                void transition(post, 'archive')
              },
            },
            () => h(Archive, { class: 'size-4' }),
          ),
        )
      }

      actions.push(
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            title: 'Hapus',
            disabled: store.isSaving,
            onClick: (e: Event) => {
              e.stopPropagation()
              void remove(post)
            },
          },
          () => h(Trash2, { class: 'size-4' }),
        ),
      )

      return h('div', { class: 'flex justify-end gap-1' }, actions)
    },
  },
])
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          {{ POST_TYPE_LABELS[postType] }}
        </CardTitle>
        <Button
          class="w-full sm:w-auto"
          @click="openNew"
        >
          <Plus class="mr-2 h-4 w-4" />
          Tulis {{ POST_TYPE_LABELS[postType] }}
        </Button>
      </CardHeader>

      <div class="p-6 space-y-4">
        <div
          v-if="store.conflict"
          class="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
        >
          {{ store.conflict }}
          <Button
            variant="link"
            size="sm"
            class="px-1"
            @click="load"
          >
            Muat ulang
          </Button>
        </div>

        <DataTable
          :columns="columns"
          :data="store.posts"
          :is-loading="store.loading"
          :item-label="POST_TYPE_LABELS[postType].toLowerCase()"
          filter-column="title"
          filter-placeholder="Cari judul atau ringkasan..."
        >
          <template #header-right>
            <Button
              size="sm"
              :variant="store.showDeleted ? 'default' : 'outline'"
              @click="store.showDeleted = !store.showDeleted"
            >
              <Trash2 class="mr-2 size-4" />
              Tempat sampah
            </Button>
          </template>
        </DataTable>
      </div>
    </Card>
  </div>
</template>
