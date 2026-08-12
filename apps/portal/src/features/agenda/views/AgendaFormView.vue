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
import { AlertTriangle, EyeOff, Save, Send } from 'lucide-vue-next'
import { CONTENT_STATUS_LABELS, RichTextEditor } from '@/features/post'
import { useDateTimeParts } from '@/composables/useDateTimeParts'
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

function toIso(local: string): string {
  return new Date(local).toISOString()
}

function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const rangeError = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return null
  return new Date(form.value.endTime) <= new Date(form.value.startTime)
    ? 'Waktu selesai harus setelah waktu mulai.'
    : null
})

const { date: startDate, time: startTimeVal } = useDateTimeParts(
  () => form.value.startTime,
  (value) => {
    form.value.startTime = value
  },
  '08:00',
)

const { date: endDate, time: endTimeVal } = useDateTimeParts(
  () => form.value.endTime,
  (value) => {
    form.value.endTime = value
  },
  '12:00',
)

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
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 w-full"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            {{ isEdit ? 'Ubah Agenda' : 'Agenda Baru' }}
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
            <Label> Mulai <span class="text-destructive">*</span> </Label>
            <div class="flex items-center gap-2">
              <DatePicker
                v-model="startDate"
                allow-future-dates
                placeholder="Tanggal mulai"
                class="min-w-0 flex-1"
              />
              <Input
                v-model="startTimeVal"
                type="time"
                class="w-32 shrink-0"
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <Label> Selesai <span class="text-destructive">*</span> </Label>
            <div class="flex items-center gap-2">
              <DatePicker
                v-model="endDate"
                allow-future-dates
                placeholder="Tanggal selesai"
                class="min-w-0 flex-1"
              />
              <Input
                v-model="endTimeVal"
                type="time"
                class="w-32 shrink-0"
              />
            </div>
            <p
              v-if="rangeError"
              class="text-xs text-destructive"
            >
              {{ rangeError }}
            </p>
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          Kegiatan yang berlangsung beberapa hari tetap masuk daftar “akan
          datang” sampai waktu selesainya lewat.
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

        <Separator />

        <div class="flex flex-wrap items-center gap-3">
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
      </CardContent>
    </Card>
  </div>
</template>
