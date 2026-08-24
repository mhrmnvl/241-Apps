<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'
import { Badge } from '@/ui/badge'
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
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
} from 'lucide-vue-next'

const props = defineProps<{
  decisions: PromotionStudentDecision[]
  recommendations: PromotionRecommendationItem[]
  isLoading?: boolean
  activeClass?: string
}>()

const searchQuery = ref('')
const filterTargetClass = ref('all')
const filterStatus = ref('all')

const decisionByStudent = computed(
  () => new Map(props.decisions.map((d) => [d.studentId, d])),
)

const previewRows = computed(() => {
  if (!props.activeClass) return []

  return props.recommendations
    .filter((rec) => rec.sourceClassroomName === props.activeClass)
    .map((rec) => {
      const decision = decisionByStudent.value.get(rec.studentId)
      const isApproved = decision ? decision.approved : true
      const action = isApproved ? (decision?.action ?? 'PROMOTE') : 'REPEAT'
      const targetClass = isApproved
        ? rec.targetClassroomName || 'Belum Ditentukan'
        : `Tinggal (${rec.sourceClassroomName})`

      return {
        studentId: rec.studentId,
        studentName: rec.studentName,
        nis: rec.nis,
        sourceClassroomName: rec.sourceClassroomName,
        targetClassroomName: targetClass,
        rawTargetClass: rec.targetClassroomName,
        action,
        isApproved,
        declineReason: decision?.declineReason,
      }
    })
})

const uniqueTargetClasses = computed(() => {
  const set = new Set<string>()
  for (const row of previewRows.value) {
    if (row.isApproved && row.rawTargetClass) {
      set.add(row.rawTargetClass)
    }
  }
  return Array.from(set).sort()
})

const filteredRows = computed(() => {
  let items = previewRows.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.nis.toLowerCase().includes(q),
    )
  }

  if (filterTargetClass.value !== 'all') {
    if (filterTargetClass.value === '__repeat__') {
      items = items.filter((r) => !r.isApproved)
    } else {
      items = items.filter(
        (r) => r.isApproved && r.rawTargetClass === filterTargetClass.value,
      )
    }
  }

  if (filterStatus.value !== 'all') {
    if (filterStatus.value === 'promote') {
      items = items.filter((r) => r.isApproved && r.action === 'PROMOTE')
    } else if (filterStatus.value === 'repeat') {
      items = items.filter((r) => !r.isApproved || r.action === 'REPEAT')
    }
  }

  return items
})

const summary = computed(() => {
  let promoted = 0
  let repeated = 0

  for (const row of previewRows.value) {
    if (row.isApproved && row.action === 'PROMOTE') {
      promoted++
    } else {
      repeated++
    }
  }

  return { promoted, repeated, total: previewRows.value.length }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Summary -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <GraduationCap class="size-4 text-primary" />
          <h3 class="font-semibold text-base text-foreground">
            Preview Kelas Tujuan
          </h3>
          <Badge
            variant="secondary"
            class="font-medium text-xs"
          >
            {{ filteredRows.length }} / {{ summary.total }} Siswa
          </Badge>
        </div>

        <!-- Summary Pills -->
        <div class="flex items-center gap-2">
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold"
          >
            <CheckCircle2 class="size-3.5" />
            <span>Naik: {{ summary.promoted }}</span>
          </div>
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold"
          >
            <RotateCcw class="size-3.5" />
            <span>Tinggal: {{ summary.repeated }}</span>
          </div>
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

        <Select v-model="filterTargetClass">
          <SelectTrigger class="h-9 text-xs">
            <Filter class="size-3 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Semua Kelas Tujuan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="all"
              class="text-xs"
            >
              Semua Kelas Tujuan
            </SelectItem>
            <SelectItem
              v-for="cls in uniqueTargetClasses"
              :key="cls"
              :value="cls"
              class="text-xs"
            >
              Kelas {{ cls }}
            </SelectItem>
            <SelectItem
              value="__repeat__"
              class="text-xs text-amber-600"
            >
              Siswa Tinggal Kelas
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
            >
              Semua Status
            </SelectItem>
            <SelectItem
              value="promote"
              class="text-xs"
            >
              Naik Kelas
            </SelectItem>
            <SelectItem
              value="repeat"
              class="text-xs"
            >
              Tinggal Kelas
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Shadcn-Vue Table Component -->
    <div class="overflow-hidden rounded-xl border bg-background shadow-xs">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="text-left font-semibold text-xs">
              Nama Siswa
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Alur Kelas
            </TableHead>
            <TableHead class="text-center font-semibold text-xs">
              Status
            </TableHead>
            <TableHead class="text-left font-semibold text-xs">
              Keterangan
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
              <TableCell class="py-3">
                <Skeleton class="h-3.5 w-32 mb-1" />
                <Skeleton class="h-3 w-20" />
              </TableCell>
              <TableCell class="text-center py-3">
                <div class="flex items-center justify-center gap-1.5">
                  <Skeleton class="h-5 w-12 rounded-full" />
                  <Skeleton class="size-3 rounded" />
                  <Skeleton class="h-5 w-14 rounded-full" />
                </div>
              </TableCell>
              <TableCell class="text-center py-3"
                ><Skeleton class="h-5 w-20 mx-auto rounded-full"
              /></TableCell>
              <TableCell class="py-3"><Skeleton class="h-3 w-24" /></TableCell>
            </TableRow>
          </template>
          <TableRow
            v-for="row in filteredRows"
            :key="row.studentId"
            class="transition-colors hover:bg-muted/30"
            :class="{
              'bg-amber-500/5': !row.isApproved || row.action === 'REPEAT',
            }"
          >
            <TableCell class="py-2.5">
              <div class="font-semibold text-xs text-foreground">
                {{ row.studentName }}
              </div>
              <div class="text-[11px] text-muted-foreground mt-0.5">
                NIS: {{ row.nis }}
              </div>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <div class="inline-flex items-center gap-1.5 font-medium">
                <Badge
                  variant="outline"
                  class="font-medium bg-background text-[11px] px-2 py-0.5"
                >
                  {{ row.sourceClassroomName }}
                </Badge>
                <ArrowRight class="size-3 text-muted-foreground" />
                <Badge
                  :variant="row.isApproved ? 'default' : 'secondary'"
                  class="font-medium text-[11px] px-2 py-0.5 shadow-none"
                  :class="{
                    'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20':
                      !row.isApproved,
                  }"
                >
                  {{ row.targetClassroomName }}
                </Badge>
              </div>
            </TableCell>
            <TableCell class="text-center py-2.5">
              <Badge
                :variant="row.isApproved ? 'default' : 'destructive'"
                class="font-medium text-[10px] px-2 py-0.5 shadow-none"
              >
                {{ row.isApproved ? 'Naik Kelas' : 'Tinggal Kelas' }}
              </Badge>
            </TableCell>
            <TableCell class="py-2.5">
              <span
                v-if="row.declineReason"
                class="text-[11px] text-destructive italic font-medium"
              >
                {{ row.declineReason }}
              </span>
              <span
                v-else
                class="text-[11px] text-muted-foreground"
              >
                -
              </span>
            </TableCell>
          </TableRow>
          <TableRow v-if="!isLoading && filteredRows.length === 0">
            <TableCell
              colspan="4"
              class="p-10 text-center"
            >
              <div
                class="flex flex-col items-center justify-center gap-1.5 text-muted-foreground"
              >
                <GraduationCap class="size-5 opacity-30" />
                <p class="font-medium text-xs">
                  {{
                    !activeClass
                      ? 'Pilih kelas untuk melihat preview'
                      : 'Tidak ada siswa ditemukan'
                  }}
                </p>
                <p class="text-[11px]">
                  {{
                    !activeClass
                      ? 'Pilih kelas di panel kiri untuk melihat hasil penempatan kelas tujuan.'
                      : 'Coba ubah filter atau kata pencarian.'
                  }}
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
