<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
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
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Textarea } from '@/ui/textarea'
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Search,
  XCircle,
} from 'lucide-vue-next'
import type {
  PromotionAction,
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'
import { usePromotionTable } from '../composables/usePromotionTable'

const props = defineProps<{
  recommendations: PromotionRecommendationItem[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:decisions': [decisions: PromotionStudentDecision[]]
  'update:filterClass': [cls: string]
}>()

const { recommendations } = toRefs(props)
const recommendationsRef = computed(() => recommendations.value ?? [])

const table = usePromotionTable(recommendationsRef, (decisions) => {
  emit('update:decisions', decisions)
})

const {
  searchQuery,
  filterClass,
  filterStatus,
  selectedIds,
  showDeclineDialog,
  declineReason,
  uniqueClasses,
  filteredRows,
  allVisibleSelected,
  toggleSelectAll,
  toggleSelect,
  getDecision,
  approveStudent,
  openDeclineDialog,
  bulkApprove,
  bulkDecline,
  handleConfirmDeclineModal,
} = table

watch(filterClass, (cls) => {
  emit('update:filterClass', cls)
})

function getActionLabel(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'Naik Kelas'
    case 'REPEAT':
      return 'Tinggal Kelas'
    default:
      return action
  }
}

function getActionVariant(action: PromotionAction) {
  switch (action) {
    case 'PROMOTE':
      return 'default' as const
    case 'REPEAT':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatScore(score?: number | null) {
  if (score == null) return '-'
  return score.toFixed(1)
}

/** Resolve the target classroom name for a student based on their current decision. */
function getTargetClass(row: PromotionRecommendationItem): string {
  const decision = getDecision(row.studentId)
  if (!decision) return row.targetClassroomName ?? '-'
  if (!decision.approved) return `Tinggal (${row.sourceClassroomName})`
  return row.targetClassroomName ?? '-'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filter Bar -->
    <div class="rounded-lg border bg-muted/20 p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
        <!-- Search -->
        <div class="relative flex-1">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Cari nama / NIS..."
            class="pl-8 h-9 text-xs"
          />
        </div>

        <!-- Kelas filter -->
        <Select v-model="filterClass">
          <SelectTrigger class="h-9 text-xs bg-background sm:w-44">
            <Filter class="size-3 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Pilih Kelas..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="cls in uniqueClasses"
              :key="cls"
              :value="cls"
              class="text-xs"
            >
              {{ cls }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Status filter -->
        <Select v-model="filterStatus">
          <SelectTrigger class="h-9 text-xs bg-background sm:w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              class="text-xs"
              >Semua Status</SelectItem
            >
            <SelectItem
              value="approved"
              class="text-xs"
              >Disetujui</SelectItem
            >
            <SelectItem
              value="declined"
              class="text-xs"
              >Ditolak</SelectItem
            >
          </SelectContent>
        </Select>

        <!-- Bulk actions -->
        <div class="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            class="h-9 text-xs font-medium"
            :disabled="selectedIds.size === 0"
            @click="bulkApprove"
          >
            <CheckCircle2 class="size-3.5 mr-1 text-green-600" />
            Setujui ({{ selectedIds.size }})
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="h-9 text-xs font-medium text-destructive hover:text-destructive"
            :disabled="selectedIds.size === 0"
            @click="bulkDecline"
          >
            <XCircle class="size-3.5 mr-1" />
            Tolak ({{ selectedIds.size }})
          </Button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-xl border bg-background shadow-xs">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[36px] px-3">
              <Checkbox
                :model-value="allVisibleSelected"
                @update:model-value="toggleSelectAll"
              />
            </TableHead>
            <TableHead class="text-left font-semibold text-xs">
              Nama Siswa
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Kelas Asal
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Nilai
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Rekomendasi
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Kelas Tujuan
            </TableHead>
            <TableHead class="text-center font-semibold text-xs w-[130px]">
              Keputusan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading skeleton rows -->
          <template v-if="isLoading">
            <TableRow
              v-for="i in 6"
              :key="i"
            >
              <TableCell class="px-3"
                ><Skeleton class="size-4 rounded"
              /></TableCell>
              <TableCell class="py-3">
                <Skeleton class="h-3.5 w-32 mb-1" />
                <Skeleton class="h-3 w-20" />
              </TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-5 w-16 mx-auto rounded-full"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-3.5 w-8 mx-auto"
              /></TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-5 w-20 mx-auto rounded-full"
              /></TableCell>
              <TableCell class="text-center py-3">
                <div class="flex items-center justify-center gap-1">
                  <Skeleton class="h-5 w-16 rounded-full" />
                  <Skeleton class="size-3 rounded" />
                  <Skeleton class="h-5 w-16 rounded-full" />
                </div>
              </TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-7 w-24 mx-auto rounded-md"
              /></TableCell>
            </TableRow>
          </template>

          <TableRow
            v-for="row in filteredRows"
            :key="row.studentId"
            class="transition-colors hover:bg-muted/30"
            :class="{
              'bg-destructive/5':
                getDecision(row.studentId)?.approved === false,
            }"
          >
            <TableCell class="px-3">
              <Checkbox
                :model-value="selectedIds.has(row.studentId)"
                @update:model-value="toggleSelect(row.studentId)"
              />
            </TableCell>
            <TableCell class="py-2.5">
              <div class="font-semibold text-xs text-foreground">
                {{ row.studentName }}
              </div>
              <div class="text-[11px] text-muted-foreground mt-0.5">
                NIS: {{ row.nis }}
              </div>
              <div
                v-if="getDecision(row.studentId)?.declineReason"
                class="text-[11px] text-destructive mt-0.5 italic"
              >
                Alasan: {{ getDecision(row.studentId)?.declineReason }}
              </div>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <Badge
                variant="outline"
                class="font-medium bg-background text-[11px] px-2 py-0.5"
              >
                {{ row.sourceClassroomName }}
              </Badge>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <span
                class="font-semibold tabular-nums text-xs"
                :class="
                  row.averageScore != null
                    ? row.averageScore >= 75
                      ? 'text-green-600'
                      : 'text-amber-600'
                    : 'text-muted-foreground'
                "
              >
                {{ formatScore(row.averageScore) }}
              </span>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <Badge
                :variant="
                  getActionVariant(
                    getDecision(row.studentId)?.action ?? row.recommendedAction,
                  )
                "
                class="font-medium text-[10px] px-2 py-0.5 shadow-none"
              >
                {{
                  getActionLabel(
                    getDecision(row.studentId)?.action ?? row.recommendedAction,
                  )
                }}
              </Badge>
            </TableCell>
            <!-- Kelas Tujuan -->
            <TableCell class="text-center py-2.5">
              <div class="flex items-center justify-center gap-1.5 text-xs">
                <Badge
                  variant="outline"
                  class="font-medium bg-background text-[11px] px-2 py-0.5"
                >
                  {{ row.sourceClassroomName }}
                </Badge>
                <ArrowRight class="size-3 text-muted-foreground shrink-0" />
                <Badge
                  :variant="
                    getDecision(row.studentId)?.approved === false
                      ? 'destructive'
                      : 'secondary'
                  "
                  class="font-medium text-[11px] px-2 py-0.5"
                >
                  {{ getTargetClass(row) }}
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <div class="flex items-center justify-center gap-1">
                <Button
                  size="sm"
                  :variant="
                    getDecision(row.studentId)?.approved ? 'default' : 'ghost'
                  "
                  class="text-xs h-7 px-2"
                  title="Setujui Kenaikan"
                  @click="approveStudent(row.studentId)"
                >
                  <CheckCircle2 class="size-3.5" />
                  <span class="ml-1 text-[11px]">Setuju</span>
                </Button>
                <Button
                  size="sm"
                  :variant="
                    getDecision(row.studentId)?.approved === false
                      ? 'destructive'
                      : 'ghost'
                  "
                  class="text-xs h-7 px-2"
                  title="Tolak Kenaikan"
                  @click="openDeclineDialog(row.studentId)"
                >
                  <XCircle class="size-3.5" />
                  <span class="ml-1 text-[11px]">Tolak</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!isLoading && filteredRows.length === 0">
            <TableCell
              colspan="7"
              class="p-10 text-center"
            >
              <div
                class="flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
              >
                <Users class="size-5 opacity-30" />
                <p class="font-medium text-xs">
                  {{
                    !filterClass
                      ? 'Pilih kelas untuk menampilkan siswa'
                      : 'Tidak ada siswa ditemukan'
                  }}
                </p>
                <p class="text-[11px]">
                  {{
                    !filterClass
                      ? 'Gunakan filter kelas di atas untuk memulai review.'
                      : 'Coba ubah filter atau kata pencarian.'
                  }}
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Decline Reason Dialog -->
    <Dialog v-model:open="showDeclineDialog">
      <DialogScrollContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alasan Penolakan</DialogTitle>
          <DialogDescription>
            Masukkan alasan mengapa siswa ini tidak naik kelas. Alasan ini akan
            tersimpan pada riwayat akademik siswa.
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Textarea
            v-model="declineReason"
            placeholder="Contoh: Nilai di bawah KKM, kehadiran kurang, dll."
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
            @click="handleConfirmDeclineModal"
          >
            Konfirmasi Tolak
          </Button>
        </DialogFooter>
      </DialogScrollContent>
    </Dialog>
  </div>
</template>
