<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
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
</script>

<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Halaman</h1>
        <p class="text-sm text-muted-foreground">
          Profil, Visi &amp; Misi, Sejarah, Kontak — informasi yang jarang
          berubah dan tidak masuk daftar berita.
        </p>
      </div>
      <Button @click="openNew">
        <Plus class="mr-2 size-4" />
        Halaman baru
      </Button>
    </header>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead class="w-56">Alamat</TableHead>
            <TableHead class="w-32">Status</TableHead>
            <TableHead class="w-40">Terbit</TableHead>
            <TableHead class="w-32 text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="store.loading">
            <TableCell
              colspan="5"
              class="py-10 text-center text-muted-foreground"
            >
              Memuat…
            </TableCell>
          </TableRow>

          <TableRow v-else-if="store.pages.length === 0">
            <TableCell
              colspan="5"
              class="py-10 text-center text-muted-foreground"
            >
              Belum ada halaman. Mulai dari “Profil” atau “Visi &amp; Misi”.
            </TableCell>
          </TableRow>

          <TableRow
            v-for="page in store.pages"
            v-else
            :key="page.id"
            class="cursor-pointer"
            @click="openEdit(page.id)"
          >
            <TableCell class="font-medium">{{ page.title }}</TableCell>
            <TableCell class="text-muted-foreground"
              >/{{ page.slug }}</TableCell
            >
            <TableCell>
              <Badge
                :variant="page.status === 'PUBLISHED' ? 'default' : 'outline'"
              >
                {{ CONTENT_STATUS_LABELS[page.status] }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatDate(page.publishedAt) }}
            </TableCell>
            <TableCell
              class="text-right"
              @click.stop
            >
              <div class="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  :title="
                    page.status === 'PUBLISHED'
                      ? 'Tarik dari publikasi'
                      : 'Terbitkan'
                  "
                  :disabled="store.isSaving"
                  @click="togglePublished(page)"
                >
                  <EyeOff
                    v-if="page.status === 'PUBLISHED'"
                    class="size-4"
                  />
                  <Eye
                    v-else
                    class="size-4"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Hapus"
                  @click="remove(page)"
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
