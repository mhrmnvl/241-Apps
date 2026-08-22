<script setup lang="ts">
import { computed, toRefs } from 'vue'
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
import { CheckCircle2, Filter, Search, Users, XCircle } from 'lucide-vue-next'
import type {
  PromotionAction,
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'
import { usePromotionTable } from '../composables/usePromotionTable'

const props = defineProps<{
  recommendations: PromotionRecommendationItem[]
}>()

const emit = defineEmits<{
  'update:decisions': [decisions: PromotionStudentDecision[]]
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
  summaryStats,
  toggleSelectAll,
  toggleSelect,
  getDecision,
  approveStudent,
  openDeclineDialog,
  bulkApprove,
  bulkDecline,
  handleConfirmDeclineModal,
} = table

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
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Action Row -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Users class="size-4 text-primary" />
          <h3 class="font-semibold text-base text-foreground">
            Daftar Siswa Asal
          </h3>
          <Badge
            variant="secondary"
            class="font-medium text-xs"
          >
            {{ filteredRows.length }} / {{ summaryStats.total }} Siswa
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            class="h-8 text-xs font-medium"
            :disabled="selectedIds.size === 0"
            @click="bulkApprove"
          >
            <CheckCircle2 class="size-3.5 mr-1 text-green-600" />
            Setujui ({{ selectedIds.size }})
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="h-8 text-xs font-medium text-destructive hover:text-destructive"
            :disabled="selectedIds.size === 0"
            @click="bulkDecline"
          >
            <XCircle class="size-3.5 mr-1" />
            Tolak ({{ selectedIds.size }})
          </Button>
        </div>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div class="relative sm:col-span-1">
          <Search
            class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Cari nama / NIS..."
            class="pl-8 h-9 text-xs"
          />
        </div>

        <Select v-model="filterClass">
          <SelectTrigger class="h-9 text-xs">
            <Filter class="size-3 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              class="text-xs"
              >Semua Kelas</SelectItem
            >
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

        <Select v-model="filterStatus">
          <SelectTrigger class="h-9 text-xs">
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
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border bg-background shadow-xs">
      <table class="w-full text-xs">
        <thead class="bg-muted/50 sticky top-0 backdrop-blur-xs z-10">
          <tr class="border-b">
            <th class="p-3 w-[36px]">
              <Checkbox
                :model-value="allVisibleSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th class="p-3 text-left font-semibold text-muted-foreground">
              Nama Siswa
            </th>
            <th class="p-3 text-center font-semibold text-muted-foreground">
              Kelas
            </th>
            <th class="p-3 text-center font-semibold text-muted-foreground">
              Nilai
            </th>
            <th class="p-3 text-center font-semibold text-muted-foreground">
              Rekomendasi
            </th>
            <th
              class="p-3 text-center font-semibold text-muted-foreground w-[130px]"
            >
              Keputusan
            </th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr
            v-for="row in filteredRows"
            :key="row.studentId"
            class="transition-colors hover:bg-muted/30"
            :class="{
              'bg-destructive/5':
                getDecision(row.studentId)?.approved === false,
            }"
          >
            <td class="p-3">
              <Checkbox
                :model-value="selectedIds.has(row.studentId)"
                @update:model-value="toggleSelect(row.studentId)"
              />
            </td>
            <td class="p-3">
              <div class="font-semibold text-foreground">
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
            </td>
            <td class="p-3 text-center">
              <Badge
                variant="outline"
                class="font-medium bg-background text-[11px] px-2 py-0.5"
              >
                {{ row.sourceClassroomName }}
              </Badge>
            </td>
            <td class="p-3 text-center">
              <span
                class="font-semibold tabular-nums"
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
            </td>
            <td class="p-3 text-center">
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
            </td>
            <td class="p-3 text-center">
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
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td
              colspan="6"
              class="p-8 text-center"
            >
              <div
                class="flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
              >
                <Search class="size-5 opacity-40" />
                <p class="font-medium text-xs">Tidak ada siswa ditemukan</p>
                <p class="text-[11px]">Coba ubah filter atau kata pencarian.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
