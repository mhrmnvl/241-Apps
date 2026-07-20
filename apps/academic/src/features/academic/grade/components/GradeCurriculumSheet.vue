<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button } from '@/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Badge } from '@/ui/badge'
import { Separator } from '@/ui/separator'
import { Loader2, X, BookOpen } from 'lucide-vue-next'
import { academicYearApi } from '@/features/academic/academic-year'
import { curriculaApi } from '@/features/academic/curriculum'
import { gradeAcademicYearService } from '../services/gradeAcademicYearService'
import type { Grade, GradeAcademicYear } from '../types'
import type { AcademicYear } from '@/features/academic/academic-year'
import type { Curricula } from '@/features/academic/curriculum'

const props = defineProps<{
  open: boolean
  grades: Grade[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

// Reference data
const academicYears = ref<AcademicYear[]>([])
const curricula = ref<Curricula[]>([])
const assignments = ref<GradeAcademicYear[]>([])

// Selected academic year untuk filter
const selectedAcademicYearId = ref('')

// Per-grade selected curriculum (sementara sebelum save)
const pendingChanges = ref<Record<string, string>>({}) // gradeId -> curriculumId
const saving = ref<Record<string, boolean>>({})
const loadingAssignments = ref(false)

const filteredCurricula = computed(() => {
  if (!selectedAcademicYearId.value)
    return curricula.value.filter((c) => c.isActive)
  return curricula.value.filter(
    (c) => c.academicYearId === selectedAcademicYearId.value && c.isActive,
  )
})

// Map gradeId -> assignment untuk tahun ajaran yang dipilih
const assignmentMap = computed(() => {
  const map: Record<string, GradeAcademicYear> = {}
  for (const a of assignments.value) {
    if (
      !selectedAcademicYearId.value ||
      a.academicYearId === selectedAcademicYearId.value
    ) {
      map[a.gradeId] = a
    }
  }
  return map
})

function getCurrentCurriculumId(gradeId: string): string {
  if (pendingChanges.value[gradeId] !== undefined) {
    return pendingChanges.value[gradeId]
  }
  return assignmentMap.value[gradeId]?.curriculumId ?? ''
}

async function loadAssignments() {
  if (!selectedAcademicYearId.value) return
  loadingAssignments.value = true
  try {
    assignments.value = await gradeAcademicYearService.getAssignments(
      selectedAcademicYearId.value,
    )
  } finally {
    loadingAssignments.value = false
  }
}

async function handleSave(grade: Grade) {
  if (!selectedAcademicYearId.value) return
  const curriculumId = pendingChanges.value[grade.id]
  if (curriculumId === undefined) return

  saving.value[grade.id] = true
  try {
    if (curriculumId === '') {
      // Remove assignment jika ada
      const existing = assignmentMap.value[grade.id]
      if (existing) {
        const result = await gradeAcademicYearService.remove(existing.id)
        if (result.success) {
          delete pendingChanges.value[grade.id]
          await loadAssignments()
        }
      } else {
        delete pendingChanges.value[grade.id]
      }
    } else {
      const result = await gradeAcademicYearService.assign({
        gradeId: grade.id,
        academicYearId: selectedAcademicYearId.value,
        curriculumId,
      })
      if (result.success) {
        delete pendingChanges.value[grade.id]
        await loadAssignments()
      }
    }
  } finally {
    saving.value[grade.id] = false
  }
}

function hasPendingChange(gradeId: string): boolean {
  if (pendingChanges.value[gradeId] === undefined) return false
  const current = assignmentMap.value[gradeId]?.curriculumId ?? ''
  return pendingChanges.value[gradeId] !== current
}

watch(selectedAcademicYearId, () => {
  pendingChanges.value = {}
  void loadAssignments()
})

watch(open, async (isOpen) => {
  if (isOpen) {
    const [ayRes, curRes] = await Promise.all([
      academicYearApi.getAcademicYears({ limit: 100 }),
      curriculaApi.getCurricula({ limit: 100 }),
    ])
    academicYears.value = ayRes.data?.data ?? []
    curricula.value = curRes.data?.data ?? []

    // Auto-select tahun ajaran aktif
    const active = academicYears.value.find((ay) => ay.isActive)
    selectedAcademicYearId.value =
      active?.id ?? academicYears.value[0]?.id ?? ''
  }
})

onMounted(async () => {
  if (props.open) {
    const [ayRes, curRes] = await Promise.all([
      academicYearApi.getAcademicYears({ limit: 100 }),
      curriculaApi.getCurricula({ limit: 100 }),
    ])
    academicYears.value = ayRes.data?.data ?? []
    curricula.value = curRes.data?.data ?? []
    const active = academicYears.value.find((ay) => ay.isActive)
    selectedAcademicYearId.value =
      active?.id ?? academicYears.value[0]?.id ?? ''
  }
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-lg flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle class="flex items-center gap-2">
          <BookOpen class="size-5" />
          Penetapan Kurikulum per Tingkat
        </SheetTitle>
        <SheetDescription>
          Tetapkan kurikulum yang berlaku untuk setiap tingkat kelas pada tahun
          ajaran tertentu.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-4 space-y-5">
          <!-- Filter Tahun Ajaran -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Tahun Ajaran</label>
            <Select v-model="selectedAcademicYearId">
              <SelectTrigger class="h-9 w-full">
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="ay in academicYears"
                  :key="ay.id"
                  :value="ay.id"
                >
                  {{ ay.name }}
                  <span
                    v-if="ay.isActive"
                    class="ml-1 text-xs text-emerald-600 font-medium"
                    >(Aktif)</span
                  >
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <!-- List Grade + Kurikulum -->
          <div
            v-if="!selectedAcademicYearId"
            class="text-sm text-muted-foreground text-center py-6"
          >
            Pilih tahun ajaran terlebih dahulu
          </div>

          <div
            v-else-if="loadingAssignments"
            class="flex justify-center py-8"
          >
            <Loader2 class="size-5 animate-spin text-muted-foreground" />
          </div>

          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="grade in [...grades].sort((a, b) => a.level - b.level)"
              :key="grade.id"
              class="rounded-lg border bg-card p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-sm">{{ grade.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    Kelas {{ grade.level }}
                  </p>
                </div>
                <Badge
                  v-if="assignmentMap[grade.id] && !hasPendingChange(grade.id)"
                  variant="secondary"
                  class="text-xs shrink-0"
                >
                  {{ assignmentMap[grade.id]?.curricula?.name ?? 'Kurikulum' }}
                </Badge>
              </div>

              <div class="flex items-center gap-2">
                <Select
                  :model-value="getCurrentCurriculumId(grade.id)"
                  @update:model-value="
                    (v) => (pendingChanges[grade.id] = String(v ?? ''))
                  "
                >
                  <SelectTrigger class="h-8 flex-1 text-sm">
                    <SelectValue placeholder="Pilih kurikulum..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <span class="text-muted-foreground"
                        >Tidak ada kurikulum</span
                      >
                    </SelectItem>
                    <SelectItem
                      v-for="c in filteredCurricula"
                      :key="c.id"
                      :value="c.id"
                    >
                      {{ c.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  v-if="hasPendingChange(grade.id)"
                  size="sm"
                  class="h-8 shrink-0"
                  :disabled="saving[grade.id]"
                  @click="handleSave(grade)"
                >
                  <Loader2
                    v-if="saving[grade.id]"
                    class="size-3 mr-1 animate-spin"
                  />
                  Simpan
                </Button>

                <Button
                  v-if="hasPendingChange(grade.id)"
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 shrink-0"
                  @click="delete pendingChanges[grade.id]"
                >
                  <X class="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <SheetFooter class="px-6 py-4 border-t shrink-0 bg-background">
        <Button
          variant="outline"
          @click="open = false"
        >
          Tutup
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
