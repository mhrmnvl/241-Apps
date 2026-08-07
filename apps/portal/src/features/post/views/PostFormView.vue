<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryService } from '@/features/taxonomy'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Separator } from '@/ui/separator'
import { Textarea } from '@/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import {
  AlertTriangle,
  Archive,
  CalendarClock,
  EyeOff,
  Paperclip,
  Save,
  Send,
} from 'lucide-vue-next'
import { MediaLibraryDialog, type MediaSelection } from '@/features/media'
import RichTextEditor from '../components/RichTextEditor.vue'
import CoverImagePicker from '../components/CoverImagePicker.vue'
import { postService } from '../services/postService'
import { usePostStore } from '../stores/postStore'
import {
  CONTENT_STATUS_LABELS,
  POST_TYPE_LABELS,
  type PostCategoryRef,
  type PostType,
} from '../types'

const route = useRoute()
const router = useRouter()
const store = usePostStore()

const postType = computed(() => (route.meta.postType as PostType) ?? 'BERITA')
const postId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => Boolean(postId.value))

const form = ref({
  title: '',
  summary: '',
  body: '',
  slug: '',
  categoryId: '',
  coverFileId: null as string | null,
  coverAltText: '',
  metaTitle: '',
  metaDescription: '',
  expiresAt: '',
  attachmentFileId: null as string | null,
})

const isAnnouncement = computed(() => postType.value === 'PENGUMUMAN')
const attachmentOpen = ref(false)

function onAttachmentSelected(selection: MediaSelection) {
  form.value.attachmentFileId = selection.fileId
}

const categories = ref<PostCategoryRef[]>([])
const scheduledAt = ref('')
const showSchedule = ref(false)

const expiresDate = computed({
  get: () => form.value.expiresAt.split('T')[0] ?? '',
  set: (date) => {
    const time = form.value.expiresAt.split('T')[1] || '23:59'
    form.value.expiresAt = date ? `${date}T${time}` : ''
  },
})

const expiresTimeVal = computed({
  get: () => form.value.expiresAt.split('T')[1] || '23:59',
  set: (time) => {
    const date = form.value.expiresAt.split('T')[0] || ''
    if (date) form.value.expiresAt = `${date}T${time}`
  },
})

const scheduledDate = computed({
  get: () => scheduledAt.value.split('T')[0] ?? '',
  set: (date) => {
    const time = scheduledAt.value.split('T')[1] || '08:00'
    scheduledAt.value = date ? `${date}T${time}` : ''
  },
})

const scheduledTimeVal = computed({
  get: () => scheduledAt.value.split('T')[1] || '08:00',
  set: (time) => {
    const date = scheduledAt.value.split('T')[0] || ''
    if (date) scheduledAt.value = `${date}T${time}`
  },
})

const tagInput = ref('')
const tagList = computed(() =>
  tagInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0),
)

const fieldLabels: Record<string, string> = {
  title: 'Judul',
  summary: 'Ringkasan',
  body: 'Isi konten',
  categoryId: 'Kategori',
  coverFileId: 'Gambar sampul',
  coverAltText: 'Teks alternatif gambar',
}

onMounted(async () => {
  store.reset()
  categories.value = (await categoryService.list()).filter(
    (category) => category.isActive,
  )

  if (postId.value) {
    const post = await postService.fetchOne(postId.value)
    if (post) {
      form.value = {
        title: post.title,
        summary: post.summary,
        body: post.body,
        slug: post.slug,
        categoryId: post.category?.id ?? '',
        coverFileId: post.coverFileId,
        coverAltText: post.coverAltText ?? '',
        metaTitle: post.metaTitle ?? '',
        metaDescription: post.metaDescription ?? '',
        expiresAt: post.expiresAt ? toLocalInput(post.expiresAt) : '',
        attachmentFileId: post.attachmentFileId,
      }
      tagInput.value = post.tags.map((tag) => tag.name).join(', ')
    }
  }
})

function payload() {
  return {
    title: form.value.title,
    summary: form.value.summary,
    body: form.value.body,
    categoryId: form.value.categoryId || undefined,
    tags: tagList.value,
    coverFileId: form.value.coverFileId ?? undefined,
    coverAltText: form.value.coverAltText || undefined,
    metaTitle: form.value.metaTitle || undefined,
    metaDescription: form.value.metaDescription || undefined,
    ...(isAnnouncement.value
      ? {
          expiresAt: form.value.expiresAt
            ? new Date(form.value.expiresAt).toISOString()
            : undefined,
          attachmentFileId: form.value.attachmentFileId ?? undefined,
        }
      : {}),
  }
}

function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function saveDraft() {
  if (!form.value.title.trim()) return

  const saved = store.current
    ? await postService.update(store.current.id, {
        ...payload(),
        version: store.current.version,
      })
    : await postService.create({ ...payload(), type: postType.value })

  if (saved && !isEdit.value) {
    await router.replace({ name: 'admin-post-edit', params: { id: saved.id } })
  }
}

async function publish() {
  if (!store.current) {
    await saveDraft()
    if (!store.current) return
  } else {
    const updated = await postService.update(store.current.id, {
      ...payload(),
      version: store.current.version,
    })
    if (!updated) return
  }

  await postService.publish(store.current.id, {
    version: store.current.version,
    scheduledAt:
      showSchedule.value && scheduledAt.value
        ? new Date(scheduledAt.value).toISOString()
        : undefined,
  })
}

const shareTitle = computed(
  () => form.value.metaTitle.trim() || form.value.title,
)
const shareDescription = computed(
  () => form.value.metaDescription.trim() || form.value.summary,
)

const sharePreviewSrc = computed(() => {
  const id = form.value.coverFileId
  return id ? `/portal/public/media/${id}?variant=preview` : null
})

const isLive = computed(
  () =>
    store.current?.status === 'PUBLISHED' ||
    store.current?.status === 'SCHEDULED',
)

async function transition(action: 'unpublish' | 'archive') {
  if (!store.current) return
  await postService.transition(store.current.id, action, {
    version: store.current.version,
  })
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
            {{ isEdit ? 'Ubah' : 'Tulis' }} {{ POST_TYPE_LABELS[postType] }}
          </CardTitle>
          <CardDescription v-if="store.current">
            Versi {{ store.current.version }}
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
          <AlertTitle>Konten berubah di tempat lain</AlertTitle>
          <AlertDescription>{{ store.conflict }}</AlertDescription>
        </Alert>

        <Alert v-if="store.missingFields.length > 0">
          <AlertTriangle class="size-4" />
          <AlertTitle>Belum bisa diterbitkan</AlertTitle>
          <AlertDescription>
            Lengkapi dulu:
            {{
              store.missingFields.map((f) => fieldLabels[f] ?? f).join(', ')
            }}.
          </AlertDescription>
        </Alert>

        <div class="space-y-1.5">
          <Label for="title"
            >Judul <span class="text-destructive">*</span></Label
          >
          <Input
            id="title"
            v-model="form.title"
            placeholder="mis. Juara 1 Olimpiade Matematika Tingkat Kabupaten"
          />
        </div>

        <div class="space-y-1.5">
          <Label for="summary">
            Ringkasan <span class="text-destructive">*</span>
          </Label>
          <Textarea
            id="summary"
            v-model="form.summary"
            rows="3"
            placeholder="Satu-dua kalimat. Tampil di daftar dan jadi cuplikan saat dibagikan."
          />
        </div>

        <div class="space-y-1.5">
          <Label for="category">
            Kategori <span class="text-destructive">*</span>
          </Label>
          <Select v-model="form.categoryId">
            <SelectTrigger
              id="category"
              class="w-full"
            >
              <SelectValue placeholder="Pilih kategori…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label for="tags">Tag</Label>
          <Input
            id="tags"
            v-model="tagInput"
            placeholder="Pisahkan dengan koma — mis. olimpiade, matematika"
          />
          <p class="text-xs text-muted-foreground">
            Tag baru dibuat otomatis saat disimpan.
            <span v-if="tagList.length > 0">
              Akan disimpan: {{ tagList.join(', ') }}.
            </span>
          </p>
        </div>

        <CoverImagePicker
          v-model:file-id="form.coverFileId"
          v-model:alt-text="form.coverAltText"
          :preview-url="store.current?.coverImageUrl"
        />

        <div class="space-y-1.5">
          <Label>Isi <span class="text-destructive">*</span></Label>
          <RichTextEditor v-model="form.body" />
        </div>

        <section
          v-if="isAnnouncement"
          class="space-y-4 rounded-md border p-4"
        >
          <h2 class="text-sm font-medium">Khusus pengumuman</h2>

          <div class="space-y-1.5">
            <Label>Berlaku sampai</Label>
            <div class="flex items-center gap-2 max-w-sm">
              <DatePicker
                v-model="expiresDate"
                allow-future-dates
                placeholder="Pilih tanggal"
                class="min-w-0 flex-1"
              />
              <Input
                v-model="expiresTimeVal"
                type="time"
                class="w-32 shrink-0"
              />
            </div>
            <p class="text-xs text-muted-foreground">
              Setelah waktu ini pengumuman keluar dari daftar aktif, tetapi
              tetap dapat dibuka lewat alamatnya. Kosongkan bila berlaku terus.
            </p>
          </div>

          <div class="space-y-1.5">
            <Label>Lampiran</Label>
            <div class="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="attachmentOpen = true"
              >
                <Paperclip class="mr-2 size-4" />
                {{
                  form.attachmentFileId ? 'Ganti lampiran' : 'Pilih lampiran'
                }}
              </Button>
              <Button
                v-if="form.attachmentFileId"
                type="button"
                variant="ghost"
                size="sm"
                @click="form.attachmentFileId = null"
              >
                Hapus
              </Button>
            </div>
            <p class="text-xs text-muted-foreground">
              Lampiran dapat diunduh publik selama pengumuman ini terbit.
            </p>
          </div>

          <MediaLibraryDialog
            v-model:open="attachmentOpen"
            @select="onAttachmentSelected"
          />
        </section>

        <details class="rounded-md border p-4">
          <summary class="cursor-pointer text-sm font-medium">
            Pengaturan pencarian &amp; berbagi
          </summary>
          <div class="mt-4 space-y-4">
            <div class="space-y-1.5">
              <Label for="meta-title">Judul di hasil pencarian</Label>
              <Input
                id="meta-title"
                v-model="form.metaTitle"
                :placeholder="form.title || 'Mengikuti judul konten'"
              />
            </div>
            <div class="space-y-1.5">
              <Label for="meta-description">Deskripsi di hasil pencarian</Label>
              <Textarea
                id="meta-description"
                v-model="form.metaDescription"
                rows="2"
                :placeholder="form.summary || 'Mengikuti ringkasan'"
              />
              <p
                class="text-xs"
                :class="
                  shareDescription.length > 160
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
                "
              >
                {{ shareDescription.length }} karakter — sekitar 160 yang
                tampil.
              </p>
            </div>

            <div class="space-y-1.5">
              <Label>Pratinjau saat dibagikan</Label>
              <div class="max-w-sm overflow-hidden rounded-lg border">
                <div class="aspect-[1200/630] bg-muted">
                  <img
                    v-if="sharePreviewSrc"
                    :src="sharePreviewSrc"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                  <p
                    v-else
                    class="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground"
                  >
                    Tanpa gambar sampul, kartu tampil polos tanpa gambar.
                  </p>
                </div>
                <div class="space-y-1 p-3">
                  <p class="text-xs uppercase text-muted-foreground">
                    mts241.sch.id
                  </p>
                  <p class="line-clamp-2 text-sm font-semibold">
                    {{ shareTitle || 'Judul konten' }}
                  </p>
                  <p class="line-clamp-2 text-xs text-muted-foreground">
                    {{ shareDescription || 'Ringkasan konten' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </details>

        <Separator />

        <div class="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            :disabled="store.isSaving || !form.title.trim()"
            @click="saveDraft"
          >
            <Save class="mr-2 size-4" />
            Simpan draf
          </Button>

          <Button
            variant="ghost"
            @click="showSchedule = !showSchedule"
          >
            <CalendarClock class="mr-2 size-4" />
            {{ showSchedule ? 'Terbitkan sekarang' : 'Jadwalkan' }}
          </Button>

          <div
            v-if="showSchedule"
            class="flex items-center gap-2"
          >
            <DatePicker
              v-model="scheduledDate"
              allow-future-dates
              placeholder="Pilih tanggal terbit"
              class="min-w-0 flex-1"
            />
            <Input
              v-model="scheduledTimeVal"
              type="time"
              class="w-32 shrink-0"
            />
          </div>

          <Button
            v-if="isLive"
            variant="ghost"
            :disabled="store.isSaving"
            @click="transition('unpublish')"
          >
            <EyeOff class="mr-2 size-4" />
            Tarik dari publikasi
          </Button>

          <Button
            v-if="store.current && store.current.status !== 'ARCHIVED'"
            variant="ghost"
            :disabled="store.isSaving"
            @click="transition('archive')"
          >
            <Archive class="mr-2 size-4" />
            Arsipkan
          </Button>

          <Button
            class="ml-auto"
            :disabled="store.isSaving"
            @click="publish"
          >
            <Send class="mr-2 size-4" />
            {{ showSchedule ? 'Jadwalkan terbit' : 'Terbitkan' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
