<script setup lang="ts">
import { lookupService } from '@/features/lookup'
import type { CalendarTypeOption } from '@/features/lookup'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { CalendarPlus, Check } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { createNonWorkingDayColumns } from '../components/nonWorkingDayColumns'
import {
  importPreview,
  loading,
  nonWorkingDays,
  workPatternService,
} from '../services/workPatternService'
import type { NonWorkingDay } from '../types'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

const year = ref(currentYear)
const activeAcademicYearId = ref('')
const calendarTypes = ref<CalendarTypeOption[]>([])
const selectedTypeId = ref('')
const syncDialogOpen = ref(false)

const selectedYear = computed({
  get: () => String(year.value),
  set: (val: string) => {
    year.value = Number(val)
  },
})

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

async function loadData() {
  try {
    const [years, types] = await Promise.all([
      lookupService.listAcademicYears(),
      lookupService.listCalendarTypes(),
    ])
    const activeYear = years.find((ay) => ay.isActive)
    if (activeYear) activeAcademicYearId.value = activeYear.id

    calendarTypes.value = types
    if (calendarTypes.value.length === 1) {
      const first = calendarTypes.value[0]
      if (first) selectedTypeId.value = first.id
    }
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data.'))
  }
}

async function handlePreview() {
  if (!activeAcademicYearId.value || !selectedTypeId.value) return
  await workPatternService.previewFromCalendar(
    activeAcademicYearId.value,
    selectedTypeId.value,
  )
}

async function handleConfirmImport() {
  await workPatternService.confirmImport(year.value)
  syncDialogOpen.value = false
}

async function handleDelete(day: NonWorkingDay) {
  const confirmed = window.confirm(`Hapus hari libur "${day.name}"?`)
  if (confirmed) {
    await workPatternService.deleteNonWorkingDay(day.id, year.value)
  }
}

const tableColumns = computed(() =>
  createNonWorkingDayColumns((day) => void handleDelete(day)),
)

watch(year, () => void workPatternService.fetchNonWorkingDays(year.value))
onMounted(() => {
  void workPatternService.fetchNonWorkingDays(year.value)
  void loadData()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Hari Libur
        </CardTitle>
        <Button
          variant="outline"
          :disabled="!activeAcademicYearId"
          @click="syncDialogOpen = true"
        >
          <CalendarPlus class="mr-2 h-4 w-4" />
          Sinkron Kalender
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <Select v-model="selectedYear">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="y in YEAR_OPTIONS"
                :key="y"
                :value="String(y)"
              >
                {{ y }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="nonWorkingDays"
          :is-loading="loading"
          item-label="hari libur"
        />
      </div>
    </Card>
  </div>

  <!-- Composed in the browser on purpose: the backend never calls the
       academic calendar, and the operator sees the dates before anything is
       written (research R9). -->
  <Dialog v-model:open="syncDialogOpen">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Sinkron dari Kalender Akademik</DialogTitle>
        <DialogDescription class="sr-only" />
      </DialogHeader>

      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div
          v-if="calendarTypes.length > 1"
          class="space-y-1.5"
        >
          <Label>Tipe Kalender</Label>
          <Select v-model="selectedTypeId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih tipe kalender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="ct in calendarTypes"
                :key="ct.id"
                :value="ct.id"
              >
                {{ ct.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-if="importPreview.length > 0"
          class="space-y-2 pt-2 border-t"
        >
          <p class="text-sm text-muted-foreground">
            <strong class="text-foreground font-semibold">
              {{ importPreview.length }} tanggal
            </strong>
            siap diimpor ke tahun {{ year }}.
          </p>
          <div
            class="max-h-44 overflow-y-auto rounded-lg border divide-y text-sm"
          >
            <p
              v-for="entry in importPreview"
              :key="entry.date + entry.name"
              class="px-3 py-2"
            >
              {{ formatDate(entry.date) }} — {{ entry.name }}
            </p>
          </div>
        </div>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0"
      >
        <Button
          variant="outline"
          @click="syncDialogOpen = false"
        >
          Batal
        </Button>
        <Button
          v-if="importPreview.length === 0"
          :disabled="!selectedTypeId"
          @click="handlePreview"
        >
          <CalendarPlus class="mr-2 h-4 w-4" />
          Lihat Pratinjau
        </Button>
        <Button
          v-else
          @click="handleConfirmImport"
        >
          <Check class="mr-2 h-4 w-4" />
          Konfirmasi Impor
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
