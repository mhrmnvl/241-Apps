<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import AttendanceInputTable from '../components/AttendanceInputTable.vue'
import { useAttendance } from '../composables/useAttendance'
import { toDateInputValue } from '@/shared/utils/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { DatePicker } from '@/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Loader2, Save } from 'lucide-vue-next'
import { onMounted, computed, ref, watch } from 'vue'
import { useRoleGuard } from '@/features/platform/auth'

const { can } = useRoleGuard()
const canRecordAttendance = computed(() => can('attendances.manage'))

const {
  loading,
  isSaving,
  classrooms,
  semesters,
  selectedClassroomId,
  selectedSemesterId,
  selectedDate,
  inputRows,
  fetchFilterOptions,
  loadAttendanceInput,
  bulkSaveAttendance,
} = useAttendance()

const activeSemester = computed(
  () => semesters.value.find((s) => s.id === selectedSemesterId.value) ?? null,
)

const academicYearLabel = computed(
  () => activeSemester.value?.academicYear?.name ?? null,
)

const semesterLabel = computed(() => {
  const name = activeSemester.value?.type?.name
  if (name === 'ODD') return 'Ganjil'
  if (name === 'EVEN') return 'Genap'
  return name ?? null
})

const classroomFilterOptions = computed<FilterOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
)

const isFilterReady = computed(() =>
  Boolean(
    selectedClassroomId.value && selectedSemesterId.value && selectedDate.value,
  ),
)

watch([selectedSemesterId, selectedClassroomId, selectedDate], () => {
  if (isFilterReady.value) {
    void loadAttendanceInput()
  }
})

/**
 * Students nobody has decided about yet.
 *
 * Every row carries a status before the teacher touches anything — a saved
 * record, the gate's suggestion, or `PRESENT` by default. That default is what
 * makes the register quick to fill and what makes an accidental save
 * dangerous: one click records the whole class as present, including the
 * children who never arrived.
 *
 * `needsDecision` is set where the gate saw nobody and no record exists, so
 * these are exactly the rows about to be saved on a guess.
 */
const undecidedCount = computed(
  () => inputRows.value.filter((row) => row.needsDecision).length,
)

const confirmOpen = ref(false)

/**
 * Save, or ask first.
 *
 * The confirmation is not a habit-forming "are you sure" on every save — it
 * appears only when there is something to be unsure about, and it says how
 * many and as what.
 */
function handleSaveClick() {
  if (undecidedCount.value > 0) {
    confirmOpen.value = true
    return
  }
  void bulkSaveAttendance()
}

async function confirmSave() {
  confirmOpen.value = false
  await bulkSaveAttendance()
}

onMounted(async () => {
  await fetchFilterOptions()
  const activeSemester = semesters.value.find((s) => s.isActive)
  if (activeSemester) {
    selectedSemesterId.value = activeSemester.id
  }
  if (!selectedClassroomId.value && classrooms.value.length > 0) {
    selectedClassroomId.value = classrooms.value[0].id
  }
  selectedDate.value = toDateInputValue()
})
</script>

<template>
  <div
    v-if="!canRecordAttendance"
    class="p-4 md:p-6 lg:p-8"
  >
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <div class="p-10 text-center text-sm text-muted-foreground">
        Anda tidak memiliki izin untuk menginput kehadiran.
      </div>
    </Card>
  </div>

  <div
    v-else
    class="p-4 md:p-6 lg:p-8"
  >
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Input Kehadiran
        </CardTitle>
      </CardHeader>

      <div class="space-y-6 p-6">
        <!-- Desktop: horizontal row with academic info badges + selects (same as Tugas) -->
        <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
          <template v-if="academicYearLabel">
            <div
              class="flex items-center gap-2 rounded-md border bg-muted/30 px-3 h-9 text-sm"
            >
              <span class="text-muted-foreground">Tahun Ajaran</span>
              <span class="font-semibold">{{ academicYearLabel }}</span>
            </div>
            <div
              class="flex items-center gap-2 rounded-md border bg-muted/30 px-3 h-9 text-sm"
            >
              <span class="text-muted-foreground">Semester</span>
              <span class="font-semibold">{{ semesterLabel }}</span>
            </div>
          </template>
          <div
            v-else
            class="flex items-center rounded-md border border-destructive/40 bg-destructive/5 px-3 h-9 text-sm text-destructive"
          >
            Belum ada semester aktif
          </div>

          <Select v-model="selectedClassroomId">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="c in classroomFilterOptions"
                :key="c.value"
                :value="c.value"
              >
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <DatePicker
            v-model="selectedDate"
            class="w-[160px]"
          />
        </div>

        <!-- Mobile: academic info badges + inline selects -->
        <div class="flex lg:hidden flex-col gap-3">
          <div
            v-if="academicYearLabel"
            class="flex items-center justify-center gap-2"
          >
            <div
              class="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 h-8 text-xs"
            >
              <span class="text-muted-foreground">Tahun Ajaran</span>
              <span class="font-semibold">{{ academicYearLabel }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 h-8 text-xs"
            >
              <span class="text-muted-foreground">Semester</span>
              <span class="font-semibold">{{ semesterLabel }}</span>
            </div>
          </div>
          <div
            v-else
            class="flex items-center rounded-md border border-destructive/40 bg-destructive/5 px-2.5 h-8 text-xs text-destructive"
          >
            Belum ada semester aktif
          </div>

          <div class="grid grid-cols-2 gap-2">
            <Select v-model="selectedClassroomId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="c in classroomFilterOptions"
                  :key="c.value"
                  :value="c.value"
                >
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              v-model="selectedDate"
              class="w-full"
            />
          </div>
        </div>

        <!-- Waiting / Empty State -->
        <Card
          v-if="!isFilterReady"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            {{
              !selectedSemesterId
                ? 'Belum ada semester aktif. Aktifkan satu lewat menu Periode Akademik.'
                : 'Pilih kelas untuk menampilkan daftar input kehadiran.'
            }}
          </CardContent>
        </Card>

        <!-- Input Table -->
        <AttendanceInputTable
          v-else
          v-model:rows="inputRows"
          :loading="loading"
        />
      </div>

      <!-- Card Footer: Tombol Simpan Kehadiran -->
      <CardFooter
        v-if="isFilterReady && inputRows.length > 0"
        class="flex items-center justify-end border-t px-6 py-4 bg-muted/20"
      >
        <p
          v-if="undecidedCount > 0"
          class="mr-auto text-sm text-amber-600 dark:text-amber-400"
        >
          {{ undecidedCount }} siswa belum dipastikan kehadirannya
        </p>

        <Button
          :disabled="isSaving || loading || inputRows.length === 0"
          @click="handleSaveClick"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 size-4 animate-spin"
          />
          <Save
            v-else
            class="mr-2 size-4"
          />
          Simpan Kehadiran
        </Button>
      </CardFooter>
    </Card>

    <AlertDialog :open="confirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan kehadiran?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ undecidedCount }} siswa tidak terdeteksi di gerbang dan belum
            Anda tandai. Mereka akan tersimpan sebagai
            <strong class="text-foreground">Hadir</strong>. Pastikan dulu
            sebelum melanjutkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="confirmOpen = false">
            Periksa Lagi
          </AlertDialogCancel>
          <AlertDialogAction @click="confirmSave">
            Simpan Sekarang
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
