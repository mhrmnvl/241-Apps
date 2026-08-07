<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Badge } from '@/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import {
  Archive,
  EyeOff,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
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

// The bin is a filter over the same endpoint, not a second screen: an editor
// looking for something they deleted is still looking for their content.
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
  // Recoverable for 30 days, and the confirmation says so — an editor who knows
  // the delete is undoable hesitates less over the ones that should be deleted.
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
</script>

<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ POST_TYPE_LABELS[postType] }}
      </h1>
      <Button @click="openNew">
        <Plus class="mr-2 size-4" />
        Tulis {{ POST_TYPE_LABELS[postType] }}
      </Button>
    </header>

    <div class="flex items-center gap-2">
      <div class="relative max-w-sm flex-1">
        <Search
          class="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
        />
        <Input
          v-model="store.search"
          placeholder="Cari judul atau ringkasan…"
          class="pl-8"
          @keyup.enter="load"
        />
      </div>
      <Button
        variant="outline"
        @click="load"
      >
        Cari
      </Button>
      <Button
        :variant="store.showDeleted ? 'default' : 'outline'"
        @click="store.showDeleted = !store.showDeleted"
      >
        <Trash2 class="mr-2 size-4" />
        Tempat sampah
      </Button>
    </div>

    <!--
      A blocking notice rather than a toast: a toast is dismissible, and losing
      this warning means the editor retries and overwrites the other person's
      work — which is the outcome the version check exists to prevent (FR-013).
    -->
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

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead class="w-32">Status</TableHead>
            <TableHead class="w-40">Kategori</TableHead>
            <TableHead class="w-48">Terbit</TableHead>
            <TableHead class="w-40">Penulis</TableHead>
            <TableHead class="w-44 text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="store.loading">
            <TableCell
              colspan="6"
              class="py-10 text-center text-muted-foreground"
            >
              Memuat…
            </TableCell>
          </TableRow>

          <TableRow v-else-if="store.posts.length === 0">
            <TableCell
              colspan="6"
              class="py-10 text-center text-muted-foreground"
            >
              <template v-if="store.showDeleted">
                Tempat sampah kosong.
              </template>
              <template v-else>
                Belum ada {{ POST_TYPE_LABELS[postType].toLowerCase() }}. Klik
                “Tulis” untuk membuat yang pertama.
              </template>
            </TableCell>
          </TableRow>

          <TableRow
            v-for="post in store.posts"
            v-else
            :key="post.id"
            class="cursor-pointer"
            @click="openEdit(post.id)"
          >
            <TableCell class="font-medium">
              <div class="flex items-center gap-2">
                <Pin
                  v-if="post.pinnedAt"
                  class="size-3.5 text-primary"
                />
                {{ post.title }}
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="STATUS_VARIANTS[post.status]">
                {{ CONTENT_STATUS_LABELS[post.status] }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ post.category?.name ?? '—' }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatDate(post.publishedAt) }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ post.authorName }}
            </TableCell>

            <!-- @click.stop throughout: the row itself opens the editor, and an
                 action button that also navigated would take the editor away
                 from the list they are working through. -->
            <TableCell
              class="text-right"
              @click.stop
            >
              <div class="flex justify-end gap-1">
                <template v-if="store.showDeleted">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Pulihkan"
                    :disabled="store.isSaving"
                    @click="restore(post)"
                  >
                    <RotateCcw class="size-4" />
                  </Button>
                </template>

                <template v-else>
                  <Button
                    variant="ghost"
                    size="icon"
                    :title="post.pinnedAt ? 'Lepas sematan' : 'Sematkan'"
                    :disabled="store.isSaving"
                    @click="transition(post, post.pinnedAt ? 'unpin' : 'pin')"
                  >
                    <PinOff
                      v-if="post.pinnedAt"
                      class="size-4"
                    />
                    <Pin
                      v-else
                      class="size-4"
                    />
                  </Button>

                  <Button
                    v-if="
                      post.status === 'PUBLISHED' || post.status === 'SCHEDULED'
                    "
                    variant="ghost"
                    size="icon"
                    title="Tarik dari publikasi"
                    :disabled="store.isSaving"
                    @click="transition(post, 'unpublish')"
                  >
                    <EyeOff class="size-4" />
                  </Button>

                  <Button
                    v-if="post.status !== 'ARCHIVED'"
                    variant="ghost"
                    size="icon"
                    title="Arsipkan"
                    :disabled="store.isSaving"
                    @click="transition(post, 'archive')"
                  >
                    <Archive class="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Hapus"
                    :disabled="store.isSaving"
                    @click="remove(post)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </template>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <p
      v-if="store.total > 0"
      class="text-sm text-muted-foreground"
    >
      {{ store.total }} konten
    </p>
  </div>
</template>
