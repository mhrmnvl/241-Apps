<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/ui/card'
import { DatePicker } from '@/ui'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Separator } from '@/ui/separator'
import { Textarea } from '@/ui/textarea'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  ImagePlus,
  Save,
  Send,
  Trash2,
} from 'lucide-vue-next'
import { MediaLibraryDialog, type MediaSelection } from '@/features/media'
import { CONTENT_STATUS_LABELS } from '@/features/post'
import { galleryService } from '../services/galleryService'
import { useGalleryStore } from '../stores/galleryStore'

const route = useRoute()
const router = useRouter()
const store = useGalleryStore()

const albumId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => Boolean(albumId.value))

const form = ref({ title: '', description: '', eventDate: '' })
const libraryOpen = ref(false)

const photos = computed(() => store.current?.photos ?? [])
const canPublish = computed(() => photos.value.length > 0)

onMounted(async () => {
  store.reset()
  if (!albumId.value) return

  const album = await galleryService.fetchOne(albumId.value)
  if (album) {
    form.value = {
      title: album.title,
      description: album.description ?? '',
      eventDate: album.eventDate.slice(0, 10),
    }
  }
})

function payload() {
  return {
    title: form.value.title,
    description: form.value.description || undefined,
    eventDate: form.value.eventDate,
  }
}

async function save() {
  if (!form.value.title.trim() || !form.value.eventDate) return

  const saved = store.current
    ? await galleryService.update(store.current.id, {
        ...payload(),
        version: store.current.version,
      })
    : await galleryService.create(payload())

  if (saved && !isEdit.value) {
    await router.replace({ name: 'admin-album-edit', params: { id: saved.id } })
  }
}

async function onPhotoSelected(selection: MediaSelection) {
  if (!store.current) {
    await save()
    if (!store.current) return
  }
  await galleryService.addPhoto(store.current.id, {
    fileId: selection.fileId,
    altText: selection.altText,
    caption: selection.caption,
  })
}

async function saveCaption(photoId: string, event: Event) {
  if (!store.current) return
  const value = (event.target as HTMLInputElement).value
  await galleryService.updatePhotoCaption(store.current.id, photoId, value)
}

async function movePhoto(index: number, delta: number) {
  if (!store.current) return
  const next = index + delta
  if (next < 0 || next >= photos.value.length) return

  const reordered = [...photos.value]
  const [moved] = reordered.splice(index, 1)
  if (!moved) return
  reordered.splice(next, 0, moved)

  await galleryService.reorderPhotos(
    store.current.id,
    reordered.map((photo) => photo.id),
  )
}

async function removePhoto(photoId: string) {
  if (!store.current) return
  await galleryService.removePhoto(store.current.id, photoId)
}

async function togglePublished() {
  if (!store.current) return
  await galleryService.setPublished(
    store.current.id,
    store.current.version,
    store.current.status !== 'PUBLISHED',
  )
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 w-full"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            {{ isEdit ? 'Ubah Album' : 'Album Baru' }}
          </CardTitle>
          <CardDescription v-if="store.current">
            Versi {{ store.current.version }} · {{ photos.length }} foto
          </CardDescription>
        </div>
        <Badge
          v-if="store.current"
          variant="secondary"
        >
          {{ CONTENT_STATUS_LABELS[store.current.status] }}
        </Badge>
      </CardHeader>

      <CardContent class="p-6 space-y-6">
        <Alert
          v-if="store.conflict"
          variant="destructive"
        >
          <AlertTriangle class="size-4" />
          <AlertTitle>Album berubah di tempat lain</AlertTitle>
          <AlertDescription>{{ store.conflict }}</AlertDescription>
        </Alert>

        <div class="space-y-1.5">
          <Label for="album-title">
            Judul album <span class="text-destructive">*</span>
          </Label>
          <Input
            id="album-title"
            v-model="form.title"
            placeholder="mis. Pentas Seni 2026"
          />
        </div>

        <div class="space-y-1.5">
          <Label for="album-date">
            Tanggal kegiatan <span class="text-destructive">*</span>
          </Label>
          <div class="w-56">
            <DatePicker
              v-model="form.eventDate"
              allow-future-dates
              placeholder="Pilih tanggal kegiatan"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <Label for="album-description">Keterangan</Label>
          <Textarea
            id="album-description"
            v-model="form.description"
            rows="3"
          />
        </div>

        <section class="space-y-3">
          <div class="flex items-center justify-between gap-4">
            <Label>Foto</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="libraryOpen = true"
            >
              <ImagePlus class="mr-2 size-4" />
              Tambah foto
            </Button>
          </div>

          <p
            v-if="photos.length === 0"
            class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground"
          >
            Album belum berisi foto. Album tanpa foto belum dapat diterbitkan.
          </p>

          <ul
            v-else
            class="space-y-2"
          >
            <li
              v-for="(photo, index) in photos"
              :key="photo.id"
              class="flex items-center gap-3 rounded-md border p-2"
            >
              <img
                :src="photo.imageUrl"
                :alt="photo.altText"
                class="size-16 shrink-0 rounded object-cover"
              />

              <div class="min-w-0 flex-1 space-y-1">
                <p class="truncate text-xs text-muted-foreground">
                  {{ photo.altText }}
                </p>
                <Input
                  :model-value="photo.caption ?? ''"
                  :aria-label="`Keterangan untuk ${photo.altText}`"
                  placeholder="Keterangan foto (opsional)"
                  class="h-8 text-sm"
                  @blur="saveCaption(photo.id, $event)"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                title="Geser ke kiri"
                :disabled="index === 0"
                @click="movePhoto(index, -1)"
              >
                <ChevronLeft class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Geser ke kanan"
                :disabled="index === photos.length - 1"
                @click="movePhoto(index, 1)"
              >
                <ChevronRight class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Hapus foto"
                @click="removePhoto(photo.id)"
              >
                <Trash2 class="size-4" />
              </Button>
            </li>
          </ul>

          <MediaLibraryDialog
            v-model:open="libraryOpen"
            with-caption
            @select="onPhotoSelected"
          />
        </section>

        <Separator />

        <div class="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            :disabled="store.isSaving || !form.title.trim() || !form.eventDate"
            @click="save"
          >
            <Save class="mr-2 size-4" />
            Simpan
          </Button>

          <Button
            class="ml-auto"
            :disabled="
              store.isSaving ||
              !store.current ||
              (store.current.status !== 'PUBLISHED' && !canPublish)
            "
            @click="togglePublished"
          >
            <component
              :is="store.current?.status === 'PUBLISHED' ? EyeOff : Send"
              class="mr-2 size-4"
            />
            {{
              store.current?.status === 'PUBLISHED'
                ? 'Tarik dari publikasi'
                : 'Terbitkan'
            }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
