<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Skeleton } from '@/ui/skeleton'
import { GraduationCap, Loader2, Users } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'
import { useStudentGraduation } from '../composables/useStudentGraduation'
import type { GraduationCandidate } from '../types'

/**
 * Who is finishing school this year, and the act of graduating them.
 *
 * Separated from Alumni, which lists the records afterwards. One screen used to
 * be both, and it opened on the record list — empty until somebody graduates —
 * with the students hidden inside a dialog. It read as a screen with no data
 * rather than one that had not been used yet.
 *
 * There is no year to choose. A school has one active academic year and one
 * final grade, and both are the server's answer; asking for either would be
 * asking somebody to restate what the system knows, with a chance of naming the
 * wrong one. Eligibility is the server's too — final grade, still enrolled, no
 * record yet — so this screen and the promotion screen cannot come to disagree
 * about who is in the last year.
 */
const { can } = useRoleGuard()

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

const canGraduate = computed(
  () =>
    can('graduations.create') &&
    selectedIds.value.size > 0 &&
    !isGraduating.value,
)

function selectEveryone() {
  selectedIds.value = new Set(
    candidates.value.map((c: GraduationCandidate) => c.studentId),
  )
}

function toggle(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleAll() {
  if (allSelected.value) selectedIds.value = new Set()
  else selectEveryone()
}

// Everyone starts ticked: graduating the whole final year is the normal case,
// and unticking the exceptions is less work than ticking the rest.
async function load() {
  await fetchCandidates()
  selectEveryone()
}

onMounted(load)

async function handleGraduate() {
  if (selectedIds.value.size === 0) return

  const result = await bulkGraduate({
    ...(graduationDate.value ? { graduationDate: graduationDate.value } : {}),
    students: [...selectedIds.value].map((studentId) => ({ studentId })),
  })

  if (result.success) {
    graduationDate.value = ''
    // Whoever was graduated now has a record, so they leave the list. What
    // remains is what was deliberately left out.
    await load()
  }
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0 gap-0"
    >
      <CardHeader
        class="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Kelulusan
          </CardTitle>
          <p
            v-if="graduationTerm"
            class="mt-1 text-sm text-muted-foreground"
          >
            Tahun ajaran {{ graduationTerm.name }}
            <template v-if="finalGradeName">
              · tingkat akhir {{ finalGradeName }}
            </template>
          </p>
        </div>

        <div
          v-if="can('graduations.create')"
          class="flex flex-wrap items-end gap-3"
        >
          <div class="grid gap-1.5">
            <Label class="text-xs">Tanggal Lulus</Label>
            <Input
              v-model="graduationDate"
              type="date"
              class="h-9 w-40 text-sm"
            />
          </div>
          <Button
            :disabled="!canGraduate"
            @click="handleGraduate"
          >
            <Loader2
              v-if="isGraduating"
              class="size-4 mr-2 animate-spin"
            />
            <GraduationCap
              v-else
              class="size-4 mr-2"
            />
            Luluskan
            <span
              v-if="selectedIds.size > 0"
              class="ml-1.5 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-semibold"
            >
              {{ selectedIds.size }}
            </span>
          </Button>
        </div>
      </CardHeader>

      <div class="p-6">
        <div
          v-if="isLoadingCandidates"
          class="space-y-2"
        >
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>

        <!-- Empty here has two meanings, and they need different words: a year
             where nobody is finishing, and one where everybody already has. -->
        <div
          v-else-if="candidates.length === 0"
          class="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground"
        >
          <Users class="size-10 opacity-40" />
          <p class="text-sm font-medium text-foreground">
            Tidak ada calon lulusan
          </p>
          <p class="max-w-sm text-sm">
            Semua siswa tingkat akhir
            <template v-if="graduationTerm">
              {{ graduationTerm.name }}
            </template>
            sudah diluluskan, atau tahun ajaran aktif belum punya kelas di
            tingkat akhir.
          </p>
        </div>

        <div
          v-else
          class="overflow-hidden rounded-lg border"
        >
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/40">
              <tr>
                <th class="w-10 px-3 py-2.5">
                  <Checkbox
                    :model-value="allSelected"
                    :disabled="!can('graduations.create')"
                    @update:model-value="toggleAll"
                  />
                </th>
                <th class="px-3 py-2.5 text-left font-medium">NIS</th>
                <th class="px-3 py-2.5 text-left font-medium">Nama</th>
                <th class="px-3 py-2.5 text-left font-medium">Kelas</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="candidate in candidates"
                :key="candidate.studentId"
                class="hover:bg-muted/30"
              >
                <td class="px-3 py-2.5">
                  <Checkbox
                    :model-value="selectedIds.has(candidate.studentId)"
                    :disabled="!can('graduations.create')"
                    @update:model-value="toggle(candidate.studentId)"
                  />
                </td>
                <td class="px-3 py-2.5 tabular-nums text-muted-foreground">
                  {{ candidate.nis }}
                </td>
                <td class="px-3 py-2.5 font-medium">
                  {{ candidate.studentName }}
                </td>
                <td class="px-3 py-2.5 text-muted-foreground">
                  {{ candidate.classroomName }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  </div>
</template>
