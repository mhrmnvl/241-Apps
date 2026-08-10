<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { AlertTriangle, Copy, Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  deviceService,
  devices,
  lastIssued,
  loading,
} from '../services/deviceService'

const showForm = ref(false)
const name = ref('')
const location = ref('')

async function submit() {
  if (!name.value.trim()) {
    toast.error('Nama gerbang wajib diisi.')
    return
  }
  const registered = await deviceService.register({
    name: name.value.trim(),
    location: location.value.trim() || undefined,
  })
  if (registered) {
    name.value = ''
    location.value = ''
    showForm.value = false
  }
}

async function copyToken() {
  if (!lastIssued.value) return
  await navigator.clipboard.writeText(lastIssued.value.token)
  toast.success('Token disalin ke clipboard.')
}

/**
 * A gate that has not been seen since Tuesday looks exactly like a gate where
 * nobody scanned. Showing the gap is what lets a petugas notice.
 */
function lastSeenLabel(value?: string | null) {
  if (!value) return 'Belum pernah connect'
  const date = new Date(value)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isStale(value?: string | null) {
  if (!value) return true
  const diffMinutes = (Date.now() - new Date(value).getTime()) / 60000
  return diffMinutes > 15
}

onMounted(() => void deviceService.fetch())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Perangkat Gerbang
          </CardTitle>
          <CardDescription class="mt-1">
            Setiap gerbang punya token sendiri yang bisa dicabut tanpa
            mengganggu gerbang lain.
          </CardDescription>
        </div>
        <Button @click="showForm = !showForm">
          <Plus class="mr-2 h-4 w-4" />
          Daftarkan
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- Shown once and never retrievable: only the hash is stored. -->
        <div
          v-if="lastIssued"
          class="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
        >
          <div
            class="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200"
          >
            <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Token untuk <strong>{{ lastIssued.device.name }}</strong> hanya
              ditampilkan sekali. Masukkan ke kiosk sekarang — jika hilang,
              terbitkan token baru.
            </p>
          </div>
          <div class="flex gap-2">
            <Input
              :model-value="lastIssued.token"
              readonly
              class="font-mono"
            />
            <Button
              variant="outline"
              @click="copyToken"
            >
              <Copy class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              @click="deviceService.clearIssued()"
            >
              Selesai
            </Button>
          </div>
        </div>

        <div
          v-if="showForm"
          class="grid gap-4 rounded-md border p-4 sm:grid-cols-2"
        >
          <div class="space-y-1">
            <Label for="device-name">Nama gerbang</Label>
            <Input
              id="device-name"
              v-model="name"
              placeholder="Gerbang Utama"
            />
          </div>
          <div class="space-y-1">
            <Label for="device-location">Lokasi</Label>
            <Input
              id="device-location"
              v-model="location"
              placeholder="Depan, dekat pos satpam"
            />
          </div>
          <div class="sm:col-span-2">
            <Button @click="submit">Simpan</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Terakhir aktif</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="device in devices"
              :key="device.id"
            >
              <TableCell>{{ device.name }}</TableCell>
              <TableCell>{{ device.location ?? '—' }}</TableCell>
              <TableCell
                :class="isStale(device.lastSeenAt) ? 'text-amber-600' : ''"
              >
                {{ lastSeenLabel(device.lastSeenAt) }}
              </TableCell>
              <TableCell>
                <Badge :variant="device.isActive ? 'default' : 'secondary'">
                  {{ device.isActive ? 'Aktif' : 'Nonaktif' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="deviceService.rotate(device.id)"
                >
                  Token baru
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!loading && devices.length === 0">
              <TableCell
                colspan="5"
                class="text-muted-foreground py-10 text-center"
              >
                Belum ada gerbang terdaftar.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
