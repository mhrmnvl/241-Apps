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
import { GraduationCap, Loader2 } from 'lucide-vue-next'
import { useStudentGraduation } from '../composables/useStudentGraduation'
import type { GraduationCandidate } from '../types'

/**
 * Graduating a cohort in one run.
 *
 * There is no term to choose. A school has one active academic year and one
 * final grade, and both are the server's answer — asking for either would be
 * asking someone to restate what the system knows, with a chance of naming the
 * wrong one. What the run will use is stated, not selected.
 *
 * Eligibility is likewise the server's: final grade, still enrolled, no record
 * yet. Nothing here re-derives it, so this screen and the promotion screen
 * cannot come to disagree about who is in the last year.
 */
const props = defineProps<{ open: boolean }>()

const emit = defineEmits<{ 'update:open': [value: boolean]; saved: [] }>()

const {
  candidates,
  graduationTerm,
  finalGradeName,
  isLoadingCandidates,
  isGraduating,
  fetchCandidates,
  bulkGraduate,
} = useStudentGraduation()

const graduationDate = ref('')
const selectedIds = ref<Set<string>>(new Set())

const allSelected = computed(
  () =>
    candidates.value.length > 0 &&
    selectedIds.value.size === candidates.value.length,
)

const canSubmit = computed(
  () => selectedIds.value.size > 0 && !isGraduating.value,
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

// Opening the dialog loads the list, and every candidate starts selected:
// graduating the whole final year is the normal case, and unticking the
// exceptions is less work than ticking the rest.
watch(
  () => props.open,
  async (open) => {
    if (!open) {
      graduationDate.value = ''
      selectedIds.value = new Set()
      return
    }
    await fetchCandidates()
    selectedIds.value = new Set(
      candidates.value.map((c: GraduationCandidate) => c.studentId),
    )
  },
)

async function handleSubmit() {
  if (selectedIds.value.size === 0) return

  const result = await bulkGraduate({
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
          <template v-if="graduationTerm">
            Meluluskan siswa kelas
            <strong class="text-foreground">{{
              finalGradeName ?? 'akhir'
            }}</strong>
            pada tahun ajaran
            <strong class="text-foreground">{{ graduationTerm.name }}</strong>
            — tahun ajaran yang sedang aktif. Siswa yang sudah punya data
            kelulusan tidak ditampilkan.
          </template>
          <template v-else>
            Menentukan siswa yang diluluskan pada tahun ajaran yang aktif.
          </template>
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-2 max-w-xs">
        <Label>Tanggal Kelulusan</Label>
        <Input
          v-model="graduationDate"
          type="date"
        />
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
          v-else-if="!graduationTerm"
          class="py-10 text-center text-sm text-muted-foreground"
        >
          Belum ada tahun ajaran aktif. Aktifkan satu terlebih dahulu.
        </p>

        <p
          v-else-if="candidates.length === 0"
          class="py-10 text-center text-sm text-muted-foreground"
        >
          Tidak ada siswa kelas {{ finalGradeName ?? 'akhir' }} yang bisa
          diluluskan saat ini.
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
