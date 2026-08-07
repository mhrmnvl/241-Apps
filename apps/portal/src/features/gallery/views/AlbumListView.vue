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
import { galleryService } from '../services/galleryService'
import { useGalleryStore } from '../stores/galleryStore'
import type { GalleryAlbum } from '../types'

const router = useRouter()
const store = useGalleryStore()

onMounted(() => void galleryService.fetchList())

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
</script>

<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Galeri</h1>
        <p class="text-sm text-muted-foreground">
          Album foto kegiatan sekolah. Album tanpa foto belum dapat diterbitkan.
        </p>
      </div>
      <Button @click="router.push({ name: 'admin-album-baru' })">
        <Plus class="mr-2 size-4" />
        Album baru
      </Button>
    </header>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Album</TableHead>
            <TableHead class="w-48">Tanggal kegiatan</TableHead>
            <TableHead class="w-24">Foto</TableHead>
            <TableHead class="w-32">Status</TableHead>
            <TableHead class="w-28 text-right">Tindakan</TableHead>
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

          <TableRow v-else-if="store.albums.length === 0">
            <TableCell
              colspan="5"
              class="py-10 text-center text-muted-foreground"
            >
              Belum ada album.
            </TableCell>
          </TableRow>

          <TableRow
            v-for="album in store.albums"
            v-else
            :key="album.id"
            class="cursor-pointer"
            @click="
              router.push({
                name: 'admin-album-edit',
                params: { id: album.id },
              })
            "
          >
            <TableCell class="font-medium">{{ album.title }}</TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatDate(album.eventDate) }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ album.photoCount ?? 0 }}
            </TableCell>
            <TableCell>
              <Badge
                :variant="album.status === 'PUBLISHED' ? 'default' : 'outline'"
              >
                {{ CONTENT_STATUS_LABELS[album.status] }}
              </Badge>
            </TableCell>
            <TableCell
              class="text-right"
              @click.stop
            >
              <div class="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  :title="album.status === 'PUBLISHED' ? 'Tarik' : 'Terbitkan'"
                  :disabled="store.isSaving"
                  @click="togglePublished(album)"
                >
                  <EyeOff
                    v-if="album.status === 'PUBLISHED'"
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
                  @click="remove(album)"
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
