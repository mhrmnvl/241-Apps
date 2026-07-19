<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { ClassroomEnrollment } from '../types'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { DataTable } from '@/ui'
import { baseColumns, selectColumn } from './enrollment-columns'
import {
  ArrowRightLeft,
  Plus,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-vue-next'

defineProps<{
  classroomEnrollments: ClassroomEnrollment[]
  capacity: number
  manageLoading: boolean
}>()

const emit = defineEmits<{
  'add-student': []
  'transfer-students': [enrollments: ClassroomEnrollment[]]
  'unenroll-students': [enrollments: ClassroomEnrollment[]]
}>()

const isManaging = ref(false)
const selectedEnrollments = ref<ClassroomEnrollment[]>([])
const enrollmentTableRef = ref<{
  table: { setPageSize: (size: number) => void }
} | null>(null)

watch(enrollmentTableRef, (tableComp) => {
  if (tableComp) {
    void nextTick(() => tableComp.table.setPageSize(100))
  }
})

const enrollmentColumns = computed<ColumnDef<ClassroomEnrollment>[]>(() =>
  isManaging.value ? [selectColumn, ...baseColumns] : baseColumns,
)

function handleSelectionChange(rows: ClassroomEnrollment[]) {
  selectedEnrollments.value = rows
}

function toggleManageMode() {
  isManaging.value = !isManaging.value
  selectedEnrollments.value = []
}

function openBulkTransfer() {
  emit('transfer-students', [...selectedEnrollments.value])
}

function handleBulkUnenroll() {
  emit('unenroll-students', [...selectedEnrollments.value])
}

defineExpose({
  resetSelection: () => {
    selectedEnrollments.value = []
    isManaging.value = false
  },
})
</script>

<template>
  <div class="rounded-xl border bg-card p-5 space-y-4">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-2">
        <Users class="h-4 w-4 text-muted-foreground" />
        <h3 class="text-sm font-semibold">Siswa Terdaftar</h3>
        <Badge
          :variant="
            classroomEnrollments.length >= capacity
              ? 'destructive'
              : 'secondary'
          "
        >
          {{ classroomEnrollments.length }} / {{ capacity }}
        </Badge>
      </div>
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <template v-if="isManaging">
          <Button
            v-if="selectedEnrollments.length > 0"
            size="sm"
            variant="outline"
            class="flex-1 sm:flex-initial"
            @click="openBulkTransfer"
          >
            <ArrowRightLeft class="h-4 w-4 mr-2" />
            Pindah Kelas ({{ selectedEnrollments.length }})
          </Button>
          <Button
            v-if="selectedEnrollments.length > 0"
            size="sm"
            variant="destructive"
            class="flex-1 sm:flex-initial"
            @click="handleBulkUnenroll"
          >
            <Trash2 class="h-4 w-4 mr-2" />
            Keluarkan ({{ selectedEnrollments.length }})
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="flex-1 sm:flex-initial"
            @click="toggleManageMode"
          >
            <X class="h-4 w-4 mr-2" />
            Selesai
          </Button>
        </template>
        <template v-else>
          <Button
            size="sm"
            variant="outline"
            class="flex-1 sm:flex-initial"
            @click="toggleManageMode"
          >
            <Settings class="h-4 w-4 mr-2" />
            Kelola Siswa
          </Button>
          <Button
            size="sm"
            class="flex-1 sm:flex-initial"
            @click="emit('add-student')"
          >
            <Plus class="h-4 w-4 mr-2" />
            Tambah Siswa
          </Button>
        </template>
      </div>
    </div>

    <div
      v-if="!manageLoading && classroomEnrollments.length === 0"
      class="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg bg-muted/20"
    >
      <Users class="h-12 w-12 text-muted-foreground/30 mb-4" />
      <p class="text-sm font-medium text-muted-foreground">
        Belum ada siswa terdaftar di kelas ini
      </p>
      <p class="text-xs text-muted-foreground mt-1">
        Klik tombol "Tambah Siswa" untuk mendaftarkan siswa.
      </p>
    </div>

    <DataTable
      v-else
      ref="enrollmentTableRef"
      :columns="enrollmentColumns"
      :data="classroomEnrollments"
      :is-loading="manageLoading"
      :total-items="classroomEnrollments.length"
      filter-column="name"
      filter-placeholder="Cari nama siswa..."
      item-label="siswa"
      hide-per-page
      hide-pagination
      @selection-change="handleSelectionChange"
    />
  </div>
</template>
