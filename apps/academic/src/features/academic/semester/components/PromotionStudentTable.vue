<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Textarea } from '@/ui/textarea'
import {
  CheckCircle2,
  Filter,
  GraduationCap,
  Search,
  XCircle,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import type {
  PromotionAction,
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'

const props = defineProps<{
  recommendations: PromotionRecommendationItem[]
}>()

const emit = defineEmits<{
  'update:decisions': [decisions: PromotionStudentDecision[]]
}>()

const decisions = ref<Map<string, PromotionStudentDecision>>(new Map())
const searchQuery = ref('')
const filterClass = ref('all')
const filterStatus = ref('all')
const selectedIds = ref<Set<string>>(new Set())
const showDeclineDialog = ref(false)
const declineTarget = ref<string | null>(null)
const declineReason = ref('')

watch(
  () => props.recommendations,
  (items) => {
    const map = new Map<string, PromotionStudentDecision>()
    for (const item of items) {
      map.set(item.studentId, {
        studentId: item.studentId,
        sourceClassroomId: item.sourceClassroomId,
        targetClassroomId: item.targetClassroomId,
        action: item.recommendedAction,
        approved: true,
        declineReason: undefined,
      })
    }
    decisions.value = map
    emitDecisions()
  },
  { immediate: true },
)

const uniqueClasses = computed(() => {
  const set = new Set<string>()
  for (const r of props.recommendations) {
    set.add(r.sourceClassName)
  }
  return Array.from(set).sort()
})

const filteredRows = computed(() => {
  let items = props.recommendations

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.nis.toLowerCase().includes(q),
    )
  }

  if (filterClass.value !== 'all') {
    items = items.filter((r) => r.sourceClassName === filterClass.value)
  }

  if (filterStatus.value !== 'all') {
    items = items.filter((r) => {
      const d = decisions.value.get(r.studentId)
      if (filterStatus.value === 'approved') return d?.approved === true
      if (filterStatus.value === 'declined') return d?.approved === false
      return true
    })
  }

  return items
})

const allVisibleSelected = computed(() => {
  if (filteredRows.value.length === 0) return false
  return filteredRows.value.every((r) => selectedIds.value.has(r.studentId))
})

const summaryStats = computed(() => {
  let approved = 0
  let declined = 0
  let graduated = 0
  for (const d of decisions.value.values()) {
    if (d.action === 'GRADUATE' && d.approved) graduated++
    else if (d.approved) approved++
    else declined++
  }
  return { approved, declined, graduated, total: decisions.value.size }
})

function toggleSelectAll() {
  if (allVisibleSelected.value) {
    for (const r of filteredRows.value) {
      selectedIds.value.delete(r.studentId)
    }
  } else {
    for (const r of filteredRows.value) {
      selectedIds.value.add(r.studentId)
    }
  }
}

function toggleSelect(studentId: string) {
  if (selectedIds.value.has(studentId)) {
    selectedIds.value.delete(studentId)
  } else {
    selectedIds.value.add(studentId)
  }
}

function getDecision(studentId: string): PromotionStudentDecision | undefined {
  return decisions.value.get(studentId)
}

function approveStudent(studentId: string) {
  const d = decisions.value.get(studentId)
  if (!d) return
  const rec = props.recommendations.find((r) => r.studentId === studentId)
  if (!rec) return

  decisions.value.set(studentId, {
    ...d,
    approved: true,
    action: rec.recommendedAction,
    targetClassroomId: rec.targetClassroomId,
    declineReason: undefined,
  })
  emitDecisions()
}

function openDeclineDialog(studentId: string) {
  declineTarget.value = studentId
  declineReason.value = ''
  showDeclineDialog.value = true
}

function confirmDecline() {
  if (!declineTarget.value || !declineReason.value.trim()) return

  const d = decisions.value.get(declineTarget.value)
  const rec = props.recommendations.find(
    (r) => r.studentId === declineTarget.value,
  )
  if (!d || !rec) return

  const sameLevel = props.recommendations.find(
    (r) => r.sourceClassName === rec.sourceClassName,
  )

  decisions.value.set(declineTarget.value, {
    ...d,
    approved: false,
    action: 'REPEAT',
    targetClassroomId: sameLevel?.targetClassroomId,
    declineReason: declineReason.value.trim(),
  })

  showDeclineDialog.value = false
  declineTarget.value = null
  declineReason.value = ''
  emitDecisions()
}

function toggleGraduate(studentId: string) {
  const d = decisions.value.get(studentId)
  if (!d) return

  if (d.action === 'GRADUATE' && d.approved) {
    openDeclineDialog(studentId)
  } else {
    decisions.value.set(studentId, {
      ...d,
      approved: true,
      action: 'GRADUATE',
      targetClassroomId: undefined,
      declineReason: undefined,
    })
    emitDecisions()
  }
}

function bulkApprove() {
  for (const id of selectedIds.value) {
    approveStudent(id)
  }
  selectedIds.value.clear()
}

function bulkDecline() {
  if (selectedIds.value.size === 0) return
  declineTarget.value = null
  declineReason.value = ''
  showDeclineDialog.value = true
}

function confirmBulkDecline() {
  if (!declineReason.value.trim()) return

  for (const studentId of selectedIds.value) {
    const d = decisions.value.get(studentId)
    const rec = props.recommendations.find((r) => r.studentId === studentId)
    if (!d || !rec) continue

    decisions.value.set(studentId, {
      ...d,
      approved: false,
      action: 'REPEAT',
      declineReason: declineReason.value.trim(),
    })
  }

  showDeclineDialog.value = false
  selectedIds.value.clear()
  emitDecisions()
}

function emitDecisions() {
  emit('update:decisions', Array.from(decisions.value.values()))
}

function getActionLabel(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'Naik Kelas'
    case 'REPEAT':
      return 'Tinggal Kelas'
    case 'GRADUATE':
      return 'Lulus'
    default:
      return action
  }
}

function getActionVariant(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'default' as const
    case 'GRADUATE':
      return 'secondary' as const
    case 'REPEAT':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatScore(score: number | null | undefined) {
  if (score == null) return '-'
  return score.toFixed(1)
}
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Cari nama atau NIS..."
            class="pl-9 w-[240px]"
          />
        </div>
        <Select v-model="filterClass">
          <SelectTrigger class="w-[160px]">
            <Filter class="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all"> Semua Kelas </SelectItem>
            <SelectItem
              v-for="cls in uniqueClasses"
              :key="cls"
              :value="cls"
            >
              {{ cls }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterStatus">
          <SelectTrigger class="w-[160px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all"> Semua Status </SelectItem>
            <SelectItem value="approved"> Disetujui </SelectItem>
            <SelectItem value="declined"> Ditolak </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          :disabled="selectedIds.size === 0"
          @click="bulkApprove"
        >
          <CheckCircle2 class="size-3.5 mr-1.5" />
          Setujui ({{ selectedIds.size }})
        </Button>
        <Button
          size="sm"
          variant="outline"
          class="text-destructive hover:text-destructive"
          :disabled="selectedIds.size === 0"
          @click="bulkDecline"
        >
          <XCircle class="size-3.5 mr-1.5" />
          Tolak ({{ selectedIds.size }})
        </Button>
      </div>
    </div>

    <div
      class="flex items-center gap-4 px-4 py-3 bg-muted/30 rounded-lg text-sm"
    >
      <div class="flex items-center gap-1.5">
        <div class="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span class="text-muted-foreground"
          >Naik:
          <strong class="text-foreground">{{
            summaryStats.approved
          }}</strong></span
        >
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span class="text-muted-foreground"
          >Tinggal:
          <strong class="text-foreground">{{
            summaryStats.declined
          }}</strong></span
        >
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-2.5 w-2.5 rounded-full bg-blue-500" />
        <span class="text-muted-foreground"
          >Lulus:
          <strong class="text-foreground">{{
            summaryStats.graduated
          }}</strong></span
        >
      </div>
      <div class="ml-auto text-muted-foreground">
        Total:
        <strong class="text-foreground">{{ summaryStats.total }}</strong> siswa
      </div>
    </div>

    <div class="overflow-x-auto rounded-xl border shadow-sm bg-background">
      <table class="w-full text-sm">
        <thead class="bg-muted/40 sticky top-0 backdrop-blur-sm z-10">
          <tr class="border-b shadow-sm">
            <th class="p-4 w-[40px]">
              <Checkbox
                :model-value="allVisibleSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th class="p-4 text-left font-semibold text-muted-foreground">
              Nama Siswa
            </th>
            <th class="p-4 text-center font-semibold text-muted-foreground">
              NIS
            </th>
            <th class="p-4 text-center font-semibold text-muted-foreground">
              Kelas
            </th>
            <th class="p-4 text-center font-semibold text-muted-foreground">
              Nilai
            </th>
            <th class="p-4 text-center font-semibold text-muted-foreground">
              Rekomendasi
            </th>
            <th class="p-4 text-center font-semibold text-muted-foreground">
              Kelas Tujuan
            </th>
            <th
              class="p-4 text-center font-semibold text-muted-foreground w-[180px]"
            >
              Keputusan
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredRows"
            :key="row.studentId"
            class="border-b transition-all duration-200 hover:bg-muted/20"
            :class="{
              'bg-destructive/5':
                getDecision(row.studentId)?.approved === false,
              'bg-secondary/5':
                getDecision(row.studentId)?.action === 'GRADUATE' &&
                getDecision(row.studentId)?.approved,
            }"
          >
            <td class="p-4">
              <Checkbox
                :model-value="selectedIds.has(row.studentId)"
                @update:model-value="toggleSelect(row.studentId)"
              />
            </td>
            <td class="p-4">
              <div class="font-semibold text-foreground">
                {{ row.studentName }}
              </div>
              <div
                v-if="getDecision(row.studentId)?.declineReason"
                class="text-xs text-destructive mt-0.5 italic"
              >
                Alasan: {{ getDecision(row.studentId)?.declineReason }}
              </div>
            </td>
            <td class="p-4 text-center text-muted-foreground font-mono text-xs">
              {{ row.nis }}
            </td>
            <td class="p-4 text-center">
              <Badge
                variant="outline"
                class="font-medium bg-background shadow-sm"
                >{{ row.sourceClassName }}</Badge
              >
            </td>
            <td class="p-4 text-center">
              <span
                class="font-semibold tabular-nums"
                :class="
                  row.averageScore != null
                    ? row.averageScore >= 75
                      ? 'text-green-600'
                      : 'text-amber-600'
                    : 'text-muted-foreground'
                "
                >{{ formatScore(row.averageScore) }}</span
              >
            </td>
            <td class="p-4 text-center">
              <Badge
                :variant="
                  getActionVariant(
                    getDecision(row.studentId)?.action ?? row.recommendedAction,
                  )
                "
                class="shadow-sm font-medium"
              >
                {{
                  getActionLabel(
                    getDecision(row.studentId)?.action ?? row.recommendedAction,
                  )
                }}
              </Badge>
            </td>
            <td class="p-4 text-center">
              <template
                v-if="getDecision(row.studentId)?.action === 'GRADUATE'"
              >
                <div
                  class="inline-flex items-center gap-1.5 text-muted-foreground/80 px-3 py-1.5 bg-muted/30 rounded-md border border-dashed border-muted"
                >
                  <GraduationCap class="h-3.5 w-3.5" />
                  <span class="italic font-medium text-xs">Lulus</span>
                </div>
              </template>
              <template v-else>
                <span class="font-medium text-foreground">{{
                  row.targetClassName ?? '-'
                }}</span>
                <span
                  v-if="row.targetLevel"
                  class="text-muted-foreground font-normal text-xs ml-1.5 bg-muted/50 px-1.5 py-0.5 rounded-full"
                  >{{ row.targetLevel }}</span
                >
              </template>
            </td>
            <td class="p-4 text-center">
              <template v-if="row.recommendedAction === 'GRADUATE'">
                <Button
                  size="sm"
                  :variant="
                    getDecision(row.studentId)?.approved
                      ? 'default'
                      : 'destructive'
                  "
                  class="text-xs h-8 px-3"
                  @click="toggleGraduate(row.studentId)"
                >
                  <GraduationCap class="size-3.5 mr-1" />
                  {{
                    getDecision(row.studentId)?.approved
                      ? 'Luluskan'
                      : 'Tidak Lulus'
                  }}
                </Button>
              </template>
              <template v-else>
                <div class="flex items-center justify-center gap-1.5">
                  <Button
                    size="sm"
                    :variant="
                      getDecision(row.studentId)?.approved ? 'default' : 'ghost'
                    "
                    class="text-xs h-8 px-3"
                    @click="approveStudent(row.studentId)"
                  >
                    <CheckCircle2 class="size-3.5 mr-1" />
                    Setuju
                  </Button>
                  <Button
                    size="sm"
                    :variant="
                      getDecision(row.studentId)?.approved === false
                        ? 'destructive'
                        : 'ghost'
                    "
                    class="text-xs h-8 px-3"
                    @click="openDeclineDialog(row.studentId)"
                  >
                    <XCircle class="size-3.5 mr-1" />
                    Tolak
                  </Button>
                </div>
              </template>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td
              colspan="8"
              class="p-12 text-center"
            >
              <div
                class="flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <div
                  class="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2"
                >
                  <Search class="h-5 w-5 opacity-50" />
                </div>
                <p class="font-medium">Tidak ada siswa ditemukan</p>
                <p class="text-sm">Coba ubah filter atau kata pencarian.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog v-model:open="showDeclineDialog">
      <DialogScrollContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alasan Penolakan</DialogTitle>
          <DialogDescription>
            Masukkan alasan mengapa siswa ini tidak naik kelas. Alasan ini akan
            tersimpan di catatan enrollment.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Textarea
            v-model="declineReason"
            placeholder="Contoh: Nilai di bawah rata-rata, kehadiran kurang, dll."
            class="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showDeclineDialog = false"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            :disabled="!declineReason.trim()"
            @click="declineTarget ? confirmDecline() : confirmBulkDecline()"
          >
            Konfirmasi Tolak
          </Button>
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
