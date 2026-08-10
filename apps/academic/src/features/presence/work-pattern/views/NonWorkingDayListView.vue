<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
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
import { CalendarPlus, Trash2 } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import {
  importPreview,
  loading,
  nonWorkingDays,
  workPatternService,
} from '../services/workPatternService'

const year = ref(new Date().getFullYear())
const academicYearId = ref('')
const typeId = ref('')

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

watch(year, () => void workPatternService.fetchNonWorkingDays(year.value))
onMounted(() => void workPatternService.fetchNonWorkingDays(year.value))
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
            Hari Libur
          </CardTitle>
          <CardDescription class="mt-1">
            Tidak ada yang dihitung alpa pada hari-hari ini, dan hari ini tidak
            menurunkan persentase kehadiran siapa pun.
          </CardDescription>
        </div>
        <Input
          v-model.number="year"
          type="number"
          min="2000"
          max="2100"
          class="w-28"
        />
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- Composed in the browser on purpose: the backend never calls the
             academic calendar, and the operator sees the dates before anything is
             written (research R9). -->
        <div class="space-y-3 rounded-lg border p-4">
          <p class="text-sm font-medium">Impor dari Kalender Akademik</p>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="space-y-1">
              <Label for="import-year">ID Tahun Ajaran</Label>
              <Input
                id="import-year"
                v-model="academicYearId"
                placeholder="UUID"
              />
            </div>
            <div class="space-y-1">
              <Label for="import-type">ID Tipe Kalender</Label>
              <Input
                id="import-type"
                v-model="typeId"
                placeholder="UUID tipe, mis. Libur Nasional"
              />
            </div>
            <div class="flex items-end">
              <Button
                variant="outline"
                :disabled="!academicYearId || !typeId"
                @click="
                  workPatternService.previewFromCalendar(academicYearId, typeId)
                "
              >
                <CalendarPlus class="mr-2 h-4 w-4" />
                Lihat Dulu
              </Button>
            </div>
          </div>

          <div
            v-if="importPreview.length > 0"
            class="space-y-2"
          >
            <p class="text-sm">
              {{ importPreview.length }} tanggal akan ditambahkan. Tanggal yang
              sudah ada dilewati, jadi impor ulang aman.
            </p>
            <div class="max-h-40 overflow-y-auto rounded border p-2 text-sm">
              <p
                v-for="entry in importPreview"
                :key="entry.date + entry.name"
              >
                {{ formatDate(entry.date) }} — {{ entry.name }}
              </p>
            </div>
            <Button @click="workPatternService.confirmImport(year)">
              Konfirmasi Impor
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="day in nonWorkingDays"
              :key="day.id"
            >
              <TableCell>{{ formatDate(day.date) }}</TableCell>
              <TableCell>{{ day.name }}</TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="workPatternService.deleteNonWorkingDay(day.id, year)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!loading && nonWorkingDays.length === 0">
              <TableCell
                colspan="3"
                class="text-muted-foreground py-10 text-center"
              >
                Belum ada hari libur untuk {{ year }}.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
