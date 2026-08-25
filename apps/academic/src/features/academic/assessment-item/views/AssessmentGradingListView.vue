<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import { createAssessmentItemColumns } from '../components/columns'
import { useAssessmentItem } from '../composables/useAssessmentItem'
import type { AssessmentItem } from '../types'
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { useRoleGuard } from '@/features/platform/auth'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Grading-mode view of assessment items.
 *
 * Same list as AssessmentItemListView, but the primary action per row is
 * entering grades — no create/edit/delete controls are exposed here.
 * Task management lives in the Tugas menu.
 */

const router = useRouter()
const { can } = useRoleGuard()

const {
  items,
  loading,
  classrooms,
  subjects,
  semesters,
  selectedClassroomId,
  selectedSubjectId,
  selectedSemesterId,
  assignments,
  teachingAssignment,
  fetchRelatedData,
  fetchItems,
} = useAssessmentItem()

const activeSemester = computed(
  () => semesters.value.find((s) => s.id === selectedSemesterId.value) ?? null,
)
const academicYearLabel = computed(
  () => activeSemester.value?.academicYear?.name ?? null,
)
const semesterLabel = computed(() => {
  const name = activeSemester.value?.type.name
  if (name === 'ODD') return 'Ganjil'
  if (name === 'EVEN') return 'Genap'
  return name ?? null
})

const classroomFilterOptions = computed<FilterOption[]>(() => {
  const allowed = new Set(
    assignments.value
      .filter(
        (a) =>
          !selectedSubjectId.value || a.subjectId === selectedSubjectId.value,
      )
      .map((a) => a.classroomId),
  )
  return classrooms.value
    .filter((c) => allowed.has(c.id))
    .map((c) => ({ value: c.id, label: c.code ?? '-' }))
})

const subjectFilterOptions = computed<FilterOption[]>(() => {
  const allowed = new Set(
    assignments.value
      .filter(
        (a) =>
          !selectedClassroomId.value ||
          a.classroomId === selectedClassroomId.value,
      )
      .map((a) => a.subjectId),
  )
  return subjects.value
    .filter((s) => allowed.has(s.id))
    .map((s) => ({ value: s.id, label: s.name }))
})

const hasSubjectChoice = computed(() => subjectFilterOptions.value.length > 1)
const selectedSubjectLabel = computed(
  () =>
    subjects.value.find((s) => s.id === selectedSubjectId.value)?.name ?? null,
)

const isFilterReady = computed(() =>
  Boolean(selectedClassroomId.value && selectedSubjectId.value),
)

const waitingFor = computed(() => {
  if (!selectedSemesterId.value) {
    return 'Belum ada semester aktif. Aktifkan satu lewat menu Periode Akademik.'
  }
  if (!selectedClassroomId.value) return 'Pilih kelas untuk menampilkan tugas.'
  if (!selectedSubjectId.value) return 'Pilih mata pelajaran terlebih dahulu.'
  if (!teachingAssignment.value) {
    return 'Tidak ada jadwal mengajar untuk kelas dan mata pelajaran ini di semester berjalan, jadi belum ada tugas yang bisa dinilai.'
  }
  return null
})

const canGrade = computed(() => can('student-scores.manage'))

const columns = computed(() =>
  createAssessmentItemColumns({
    // No edit/delete in grading view — task management is in the Tugas menu.
    canUpdate: false,
    canDelete: false,
    onGrade: canGrade.value
      ? (item: AssessmentItem) => {
          void router.push({
            name: 'StudentScoreGrading',
            params: { assessmentItemId: item.id },
          })
        }
      : undefined,
  }),
)

async function handleFilter() {
  if (!isFilterReady.value) return
  await fetchItems()
}

function reconcile(
  selected: typeof selectedSubjectId,
  options: FilterOption[],
) {
  if (selected.value && !options.some((o) => o.value === selected.value)) {
    selected.value = null
  }
  if (!selected.value && options.length === 1) {
    selected.value = options[0].value
  }
}

watch(classroomFilterOptions, (options) =>
  reconcile(selectedClassroomId, options),
)
watch(subjectFilterOptions, (options) => reconcile(selectedSubjectId, options))

watch([selectedClassroomId, selectedSubjectId, selectedSemesterId], () => {
  if (isFilterReady.value) void handleFilter()
})

onMounted(fetchRelatedData)
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
          Penilaian
        </CardTitle>
      </CardHeader>

      <div class="space-y-6 p-6">
        <!-- Desktop Filter Bar -->
        <div class="hidden lg:flex lg:flex-row lg:items-center gap-3 mb-6">
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
            <SelectTrigger class="w-[92px]">
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

          <Select
            v-if="hasSubjectChoice"
            v-model="selectedSubjectId"
          >
            <SelectTrigger class="w-[220px]">
              <SelectValue placeholder="Pilih Mata Pelajaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="sub in subjectFilterOptions"
                :key="sub.value"
                :value="sub.value"
              >
                {{ sub.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <div
            v-else-if="selectedSubjectLabel"
            class="flex items-center gap-2 rounded-md border bg-muted/30 px-3 h-9 text-sm"
          >
            <span class="text-muted-foreground">Mapel</span>
            <span class="font-semibold">{{ selectedSubjectLabel }}</span>
          </div>
        </div>

        <!-- Mobile: academic info + inline selects -->
        <div class="flex lg:hidden flex-col gap-3 mb-6">
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

          <div class="flex justify-center">
            <Select v-model="selectedClassroomId">
              <SelectTrigger class="rounded-r-none border-r-0 min-w-0">
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

            <Select
              v-if="hasSubjectChoice"
              v-model="selectedSubjectId"
            >
              <SelectTrigger class="rounded-l-none min-w-0">
                <SelectValue placeholder="Mapel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="sub in subjectFilterOptions"
                  :key="sub.value"
                  :value="sub.value"
                >
                  {{ sub.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <div
              v-else-if="selectedSubjectLabel"
              class="flex items-center gap-2 rounded-l-none rounded-r-md border bg-muted/30 px-3 h-9 text-sm min-w-0"
            >
              <span class="text-muted-foreground shrink-0">Mapel</span>
              <span class="font-semibold truncate">{{
                selectedSubjectLabel
              }}</span>
            </div>
          </div>
        </div>

        <DataTable
          v-if="!waitingFor"
          :columns="columns"
          :data="items"
          :is-loading="loading"
          item-label="tugas"
          filter-column="name"
          filter-placeholder="Cari nama tugas..."
        />

        <div
          v-else
          class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 px-6 py-16 text-center"
        >
          <h3 class="text-lg font-semibold text-foreground">
            Belum ada tugas untuk dinilai
          </h3>
          <p class="mt-2 max-w-md text-sm text-muted-foreground">
            {{ waitingFor }}
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
