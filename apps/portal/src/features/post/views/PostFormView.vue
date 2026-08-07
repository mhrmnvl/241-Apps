<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryService } from '@/features/taxonomy'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
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
  // Pengumuman only — the API rejects both on any other type (FR-043, FR-044).
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

/**
 * Tags are typed, not picked (FR-038): they are created on first use, so a
 * picker would only ever offer what someone typed before. Comma-separated is
 * what an editor already expects from every other tag field they have used.
 */
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
  // Active only: a deactivated category stays on the content already filed
  // under it but must not be offered for anything new (FR-036).
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
    // Sent only for Pengumuman. Including them as undefined on other types
    // would be harmless, but sending them at all invites the API's 400 the
    // moment someone changes how "empty" is represented.
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

/** `datetime-local` gives a naive local string; the API takes an instant. */
function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Saving a draft deliberately validates nothing beyond a title — half-finished
 * work is the entire point of a draft. Completeness is checked at publish.
 */
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

/**
 * The share card as a crawler will build it, mirroring the server's fallback
 * rules: a blank override falls through to the title/summary rather than
 * publishing an empty tag (FR-068).
 */
const shareTitle = computed(
  () => form.value.metaTitle.trim() || form.value.title,
)
const shareDescription = computed(
  () => form.value.metaDescription.trim() || form.value.summary,
)

/**
 * The 1200×630 variant, which is what actually goes out — previewing the
 * full-size original here would show a card that looks right and then arrives
 * without an image, because WhatsApp drops images it considers too large.
 */
const sharePreviewSrc = computed(() => {
  const id = form.value.coverFileId
  return id ? `/portal/public/media/${id}?variant=preview` : null
})

/** Live means "a visitor can see it": published, or scheduled and already due. */
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
  <div class="mx-auto max-w-3xl space-y-6 p-6">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isEdit ? 'Ubah' : 'Tulis' }} {{ POST_TYPE_LABELS[postType] }}
        </h1>
        <p
          v-if="store.current"
          class="text-sm text-muted-foreground"
        >
          Versi {{ store.current.version }}
        </p>
      </div>
      <Badge
        v-if="store.current"
        variant="secondary"
      >
        {{ CONTENT_STATUS_LABELS[store.current.status] }}
      </Badge>
    </header>

    <!-- A concurrent save is shown as a blocking notice, not a toast: a toast
         is dismissible, and losing this warning means losing someone's work. -->
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
        {{ store.missingFields.map((f) => fieldLabels[f] ?? f).join(', ') }}.
      </AlertDescription>
    </Alert>

    <div class="space-y-1.5">
      <Label for="title">Judul <span class="text-destructive">*</span></Label>
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
      <select
        id="category"
        v-model="form.categoryId"
        class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
      >
        <option value="">Pilih kategori…</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
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

    <!-- Pengumuman-only fields. Hidden rather than disabled on other types:
         a greyed-out expiry on a Berita raises a question with no answer. -->
    <section
      v-if="isAnnouncement"
      class="space-y-4 rounded-md border p-4"
    >
      <h2 class="text-sm font-medium">Khusus pengumuman</h2>

      <div class="space-y-1.5">
        <Label for="expires-at">Berlaku sampai</Label>
        <Input
          id="expires-at"
          v-model="form.expiresAt"
          type="datetime-local"
          class="w-64"
        />
        <p class="text-xs text-muted-foreground">
          Setelah waktu ini pengumuman keluar dari daftar aktif, tetapi tetap
          dapat dibuka lewat alamatnya. Kosongkan bila berlaku terus.
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
            {{ form.attachmentFileId ? 'Ganti lampiran' : 'Pilih lampiran' }}
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
            {{ shareDescription.length }} karakter — sekitar 160 yang tampil.
          </p>
        </div>

        <!--
          A live card, because the fields above are abstract until you see them
          rendered. The single most common mistake this catches is a
          description written for the article rather than for the person
          deciding whether to tap the link.
        -->
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

    <div class="flex flex-wrap items-center gap-3 border-t pt-6">
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

      <Input
        v-if="showSchedule"
        v-model="scheduledAt"
        type="datetime-local"
        class="w-56"
      />

      <!-- Only offered once there is something live to withdraw. Showing them
           on a draft would invite the question of what they would even do. -->
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
  </div>
</template>
