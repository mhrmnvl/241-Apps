<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Alert, AlertDescription, AlertTitle } from '@/ui/alert'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { AlertTriangle, EyeOff, Save, Send } from 'lucide-vue-next'
import { CONTENT_STATUS_LABELS, RichTextEditor } from '@/features/post'
import { agendaService } from '../services/agendaService'
import { useAgendaStore } from '../stores/agendaStore'

const route = useRoute()
const router = useRouter()
const store = useAgendaStore()

const entryId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => Boolean(entryId.value))

const form = ref({
  title: '',
  description: '',
  location: '',
  startTime: '',
  endTime: '',
})

/**
 * `datetime-local` gives a naive local string; the API takes an absolute
 * instant. Converting through `Date` here treats what the editor typed as
 * their own local time, which is the only reading that matches what they meant
 * — the school's staff are in WIB and so is their browser.
 */
function toIso(local: string): string {
  return new Date(local).toISOString()
}

/** The inverse, for loading an existing entry back into the picker. */
function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Mirrors the API's rule (FR-042), so the editor sees it before saving rather
// than as a 400 afterwards. The server still enforces it — this is convenience.
const rangeError = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return null
  return new Date(form.value.endTime) <= new Date(form.value.startTime)
    ? 'Waktu selesai harus setelah waktu mulai.'
    : null
})

const canSave = computed(
  () =>
    form.value.title.trim().length > 0 &&
    form.value.location.trim().length > 0 &&
    form.value.startTime.length > 0 &&
    form.value.endTime.length > 0 &&
    rangeError.value === null,
)

onMounted(async () => {
  store.reset()
  if (!entryId.value) return

  const entry = await agendaService.fetchOne(entryId.value)
  if (entry) {
    form.value = {
      title: entry.title,
      description: entry.description,
      location: entry.location,
      startTime: toLocalInput(entry.startTime),
      endTime: toLocalInput(entry.endTime),
    }
  }
})

function payload() {
  return {
    title: form.value.title,
    description: form.value.description,
    location: form.value.location,
    startTime: toIso(form.value.startTime),
    endTime: toIso(form.value.endTime),
  }
}

async function save() {
  if (!canSave.value) return

  const saved = store.current
    ? await agendaService.update(store.current.id, {
        ...payload(),
        version: store.current.version,
      })
    : await agendaService.create(payload())

  if (saved && !isEdit.value) {
    await router.replace({
      name: 'admin-agenda-edit',
      params: { id: saved.id },
    })
  }
}

async function togglePublished() {
  if (!store.current) {
    await save()
    if (!store.current) return
  }
  await agendaService.setPublished(
    store.current.id,
    store.current.version,
    store.current.status !== 'PUBLISHED',
  )
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 p-6">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isEdit ? 'Ubah Agenda' : 'Agenda Baru' }}
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

    <Alert
      v-if="store.conflict"
      variant="destructive"
    >
      <AlertTriangle class="size-4" />
      <AlertTitle>Agenda berubah di tempat lain</AlertTitle>
      <AlertDescription>{{ store.conflict }}</AlertDescription>
    </Alert>

    <div class="space-y-1.5">
      <Label for="agenda-title">
        Nama kegiatan <span class="text-destructive">*</span>
      </Label>
      <Input
        id="agenda-title"
        v-model="form.title"
        placeholder="mis. Pentas Seni Akhir Tahun"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-1.5">
        <Label for="agenda-start">
          Mulai <span class="text-destructive">*</span>
        </Label>
        <Input
          id="agenda-start"
          v-model="form.startTime"
          type="datetime-local"
        />
      </div>
      <div class="space-y-1.5">
        <Label for="agenda-end">
          Selesai <span class="text-destructive">*</span>
        </Label>
        <Input
          id="agenda-end"
          v-model="form.endTime"
          type="datetime-local"
        />
        <p
          v-if="rangeError"
          class="text-xs text-destructive"
        >
          {{ rangeError }}
        </p>
      </div>
    </div>

    <p class="text-xs text-muted-foreground">
      Kegiatan yang berlangsung beberapa hari tetap masuk daftar “akan datang”
      sampai waktu selesainya lewat.
    </p>

    <div class="space-y-1.5">
      <Label for="agenda-location">
        Lokasi <span class="text-destructive">*</span>
      </Label>
      <Input
        id="agenda-location"
        v-model="form.location"
        placeholder="mis. Aula MTs Persis 241"
      />
    </div>

    <div class="space-y-1.5">
      <Label>Keterangan</Label>
      <RichTextEditor v-model="form.description" />
    </div>

    <div class="flex flex-wrap items-center gap-3 border-t pt-6">
      <Button
        variant="outline"
        :disabled="store.isSaving || !canSave"
        @click="save"
      >
        <Save class="mr-2 size-4" />
        Simpan
      </Button>

      <Button
        class="ml-auto"
        :disabled="store.isSaving || !canSave"
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
  </div>
</template>
