<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Label } from '@/ui/label'
import { Input } from '@/ui/input'
import { Checkbox } from '@/ui/checkbox'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { GraduationCap, Loader2 } from 'lucide-vue-next'
import { useStudentGraduation } from '../composables/useStudentGraduation'
import type { GraduationCandidate } from '../types'

/**
 * Graduating a cohort in one run.
 *
 * The candidate list comes from the server, which decides eligibility — final
 * grade, still enrolled, no record yet. Nothing here re-derives that: a screen
 * that decided for itself who is in the final year would eventually disagree
 * with the promotion screen, which uses the same rule to decide who to leave
 * out.
 */
const props = defineProps<{
  open: boolean
  semesters: { id: string; name: string; academicYearId: string }[]
}>()

const emit = defineEmits<{ 'update:open': [value: boolean]; saved: [] }>()

const {
  candidates,
  isLoadingCandidates,
  isGraduating,
  fetchCandidates,
  bulkGraduate,
} = useStudentGraduation()

const semesterId = ref('')
const graduationDate = ref('')
const selectedIds = ref<Set<string>>(new Set())

const semesterOptions = computed<ComboboxOption[]>(() =>
  props.semesters.map((s) => ({ value: s.id, label: s.name })),
)

const selectedSemester = computed(() =>
  props.semesters.find((s) => s.id === semesterId.value),
)

const allSelected = computed(
  () =>
    candidates.value.length > 0 &&
    selectedIds.value.size === candidates.value.length,
)

const canSubmit = computed(
  () =>
    selectedIds.value.size > 0 &&
    !!selectedSemester.value &&
    !isGraduating.value,
)

function toggle(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleAll() {
  selectedIds.value = allSelected.value
    ? new Set()
    : new Set(candidates.value.map((c: GraduationCandidate) => c.studentId))
}

// Every candidate starts selected: graduating the whole final year is the
// normal case, and unticking the exceptions is less work than ticking the rest.
watch(semesterId, async (id) => {
  selectedIds.value = new Set()
  if (!id) return
  await fetchCandidates(id)
  selectedIds.value = new Set(
    candidates.value.map((c: GraduationCandidate) => c.studentId),
  )
})

watch(
  () => props.open,
  (open) => {
    if (open) return
    semesterId.value = ''
    graduationDate.value = ''
    selectedIds.value = new Set()
  },
)

async function handleSubmit() {
  const semester = selectedSemester.value
  if (!semester || selectedIds.value.size === 0) return

  const result = await bulkGraduate({
    academicYearId: semester.academicYearId,
    ...(graduationDate.value ? { graduationDate: graduationDate.value } : {}),
    students: [...selectedIds.value].map((studentId) => ({ studentId })),
  })

  if (result.success) {
    emit('update:open', false)
    emit('saved')
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <GraduationCap class="h-5 w-5" />
          Luluskan Siswa
        </DialogTitle>
        <DialogDescription>
          Pilih semester akhir, lalu tentukan siapa yang diluluskan. Siswa yang
          sudah punya data kelulusan tidak ditampilkan di sini.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="grid gap-2">
          <Label>Semester Akhir</Label>
          <AppCombobox
            v-model="semesterId"
            :options="semesterOptions"
            placeholder="Pilih semester"
            search-placeholder="Cari semester..."
            empty-text="Semester tidak ditemukan."
          />
        </div>
        <div class="grid gap-2">
          <Label>Tanggal Kelulusan</Label>
          <Input
            v-model="graduationDate"
            type="date"
          />
        </div>
      </div>

      <div class="rounded-lg border max-h-[45vh] overflow-y-auto">
        <div
          v-if="isLoadingCandidates"
          class="flex items-center justify-center gap-2 py-10 text-muted-foreground"
        >
          <Loader2 class="h-4 w-4 animate-spin" />
          Memuat calon lulusan...
        </div>

        <p
          v-else-if="!semesterId"
          class="py-10 text-center text-sm text-muted-foreground"
        >
          Pilih semester terlebih dahulu.
        </p>

        <p
          v-else-if="candidates.length === 0"
          class="py-10 text-center text-sm text-muted-foreground"
        >
          Tidak ada siswa tingkat akhir yang bisa diluluskan di semester ini.
        </p>

        <table
          v-else
          class="w-full text-sm"
        >
          <thead class="sticky top-0 bg-muted/50">
            <tr class="border-b">
              <th class="p-3 w-10">
                <Checkbox
                  :model-value="allSelected"
                  @update:model-value="toggleAll"
                />
              </th>
              <th class="p-3 text-left font-medium">Nama</th>
              <th class="p-3 text-left font-medium">NIS</th>
              <th class="p-3 text-left font-medium">Kelas</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in candidates"
              :key="c.studentId"
              class="border-b last:border-0 hover:bg-muted/20"
            >
              <td class="p-3">
                <Checkbox
                  :model-value="selectedIds.has(c.studentId)"
                  @update:model-value="toggle(c.studentId)"
                />
              </td>
              <td class="p-3 font-medium">{{ c.studentName }}</td>
              <td class="p-3 text-muted-foreground">{{ c.nis }}</td>
              <td class="p-3 text-muted-foreground">
                {{ c.classroomName }} · {{ c.gradeName }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DialogFooter class="gap-2 sm:justify-between">
        <p class="text-sm text-muted-foreground self-center">
          <strong class="text-foreground">{{ selectedIds.size }}</strong> dari
          {{ candidates.length }} siswa dipilih
        </p>
        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="emit('update:open', false)"
          >
            Batal
          </Button>
          <Button
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <Loader2
              v-if="isGraduating"
              class="h-4 w-4 mr-2 animate-spin"
            />
            Luluskan {{ selectedIds.size }} Siswa
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
