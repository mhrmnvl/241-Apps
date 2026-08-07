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
import { agendaService } from '../services/agendaService'
import { useAgendaStore } from '../stores/agendaStore'
import type { AgendaEntry } from '../types'

const router = useRouter()
const store = useAgendaStore()

onMounted(() => void agendaService.fetchList())

function openNew() {
  void router.push({ name: 'admin-agenda-baru' })
}

function openEdit(id: string) {
  void router.push({ name: 'admin-agenda-edit', params: { id } })
}

async function togglePublished(entry: AgendaEntry) {
  await agendaService.setPublished(
    entry.id,
    entry.version,
    entry.status !== 'PUBLISHED',
  )
}

async function remove(entry: AgendaEntry) {
  if (!window.confirm(`Hapus agenda "${entry.title}"?`)) return
  await agendaService.remove(entry.id)
}

function formatRange(entry: AgendaEntry) {
  const format = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })
  return `${format.format(new Date(entry.startTime))} – ${format.format(new Date(entry.endTime))}`
}
</script>

<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p class="text-sm text-muted-foreground">
          Kegiatan sekolah yang ditampilkan ke publik. Terpisah dari agenda
          kelas di SIAKAD.
        </p>
      </div>
      <Button @click="openNew">
        <Plus class="mr-2 size-4" />
        Agenda baru
      </Button>
    </header>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kegiatan</TableHead>
            <TableHead class="w-64">Waktu</TableHead>
            <TableHead class="w-40">Lokasi</TableHead>
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

          <TableRow v-else-if="store.entries.length === 0">
            <TableCell
              colspan="5"
              class="py-10 text-center text-muted-foreground"
            >
              Belum ada agenda.
            </TableCell>
          </TableRow>

          <TableRow
            v-for="entry in store.entries"
            v-else
            :key="entry.id"
            class="cursor-pointer"
            @click="openEdit(entry.id)"
          >
            <TableCell class="font-medium">{{ entry.title }}</TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatRange(entry) }}
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ entry.location }}
            </TableCell>
            <TableCell>
              <Badge
                :variant="entry.status === 'PUBLISHED' ? 'default' : 'outline'"
              >
                {{ CONTENT_STATUS_LABELS[entry.status] }}
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
                  :title="entry.status === 'PUBLISHED' ? 'Tarik' : 'Terbitkan'"
                  :disabled="store.isSaving"
                  @click="togglePublished(entry)"
                >
                  <EyeOff
                    v-if="entry.status === 'PUBLISHED'"
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
                  @click="remove(entry)"
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
