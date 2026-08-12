<script setup lang="ts">
import { teacherApi } from '@/features/academic/teacher'
import { PAGINATION } from '@/shared/constants/pagination'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { DataTable, DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  createCurrentAssignmentColumns,
  createHistoryAssignmentColumns,
} from '../components/workPatternAssignmentColumns'
import {
  assignments,
  loading,
  patterns,
  workPatternService,
} from '../services/workPatternService'

import type { EmployeeOption } from '../types'

const employees = ref<EmployeeOption[]>([])
const dialogOpen = ref(false)
const saving = ref(false)

const form = ref({
  userId: '',
  workPatternId: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
})

/**
 * What is in force, and what it replaced.
 *
 * A superseded assignment is closed rather than deleted, because it is what
 * explains why a day two months ago counted as late.
 */
const current = computed(() =>
  assignments.value.filter((assignment) => assignment.effectiveTo === null),
)
const superseded = computed(() =>
  assignments.value.filter((assignment) => assignment.effectiveTo !== null),
)

const currentColumns = computed(() => createCurrentAssignmentColumns())
const historyColumns = computed(() => createHistoryAssignmentColumns())

async function loadEmployees() {
  try {
    const res = await teacherApi.getTeachers({
      isActive: true,
      limit: PAGINATION.REFERENCE_LIMIT,
    })
    employees.value = (res.data?.data ?? []).map((teacher) => ({
      userId: teacher.user.id,
      name: teacher.user.profile.name,
      identifier: teacher.nip ?? teacher.user.identifier,
    }))
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data pegawai.'))
  }
}

async function submit() {
  if (!form.value.userId || !form.value.workPatternId) return

  saving.value = true
  const ok = await workPatternService.assign({ ...form.value })
  saving.value = false
  if (ok) dialogOpen.value = false
}

onMounted(async () => {
  await Promise.all([
    loadEmployees(),
    workPatternService.fetchPatterns(),
    workPatternService.fetchAssignments(),
  ])
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/10"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Penugasan Pola Kerja
        </CardTitle>
        <Button @click="dialogOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          Tugaskan
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div>
          <DataTable
            :columns="currentColumns"
            :data="current"
            :is-loading="loading"
            item-label="penugasan pola kerja"
          />
        </div>

        <div
          v-if="superseded.length > 0"
          class="pt-4 border-t"
        >
          <h3 class="mb-3 text-base font-semibold">Riwayat Penugasan</h3>
          <DataTable
            :columns="historyColumns"
            :data="superseded"
            :is-loading="loading"
            item-label="riwayat penugasan"
          />
        </div>
      </div>
    </Card>

    <Dialog v-model:open="dialogOpen">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
          <DialogTitle>Tugaskan Pola Kerja</DialogTitle>
          <DialogDescription class="sr-only" />
        </DialogHeader>

        <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="space-y-1.5">
            <Label>Pegawai</Label>
            <Select v-model="form.userId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Pilih pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="employee in employees"
                  :key="employee.userId"
                  :value="employee.userId"
                >
                  {{ employee.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label>Pola kerja</Label>
            <Select v-model="form.workPatternId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Pilih pola kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="pattern in patterns"
                  :key="pattern.id"
                  :value="pattern.id"
                >
                  {{ pattern.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label>Berlaku mulai</Label>
            <DatePicker v-model="form.effectiveFrom" />
          </div>
        </div>

        <DialogFooter
          class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2 shrink-0"
        >
          <Button
            variant="outline"
            @click="dialogOpen = false"
          >
            Batal
          </Button>
          <Button
            :disabled="saving || !form.userId || !form.workPatternId"
            @click="submit"
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
