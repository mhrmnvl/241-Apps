<script setup lang="ts">
import { teacherApi } from '@/features/academic/teacher'
import { PAGINATION } from '@/shared/constants/pagination'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  assignments,
  loading,
  patterns,
  workPatternService,
} from '../services/workPatternService'

interface EmployeeOption {
  userId: string
  name: string
  identifier: string
}

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
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Penugasan Pola Kerja</h1>
        <p class="text-muted-foreground text-sm">
          Pegawai tanpa penugasan memakai pola default — penugasan di sini hanya
          untuk yang jam kerjanya berbeda.
        </p>
      </div>
      <Button @click="dialogOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Tugaskan
      </Button>
    </div>

    <div>
      <h2 class="mb-2 text-sm font-medium">Berlaku saat ini</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pegawai</TableHead>
            <TableHead>Pola kerja</TableHead>
            <TableHead>Berlaku mulai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="assignment in current"
            :key="assignment.id"
          >
            <TableCell>
              {{
                assignment.holder.displayName ?? assignment.holder.identifier
              }}
            </TableCell>
            <TableCell>{{ assignment.patternName }}</TableCell>
            <TableCell>{{ assignment.effectiveFrom.slice(0, 10) }}</TableCell>
          </TableRow>

          <TableRow v-if="!loading && current.length === 0">
            <TableCell
              colspan="3"
              class="text-muted-foreground py-10 text-center"
            >
              Belum ada penugasan khusus. Semua pegawai memakai pola default.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-if="superseded.length > 0">
      <h2 class="mb-2 text-sm font-medium">Riwayat</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pegawai</TableHead>
            <TableHead>Pola kerja</TableHead>
            <TableHead>Periode</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="assignment in superseded"
            :key="assignment.id"
            class="text-muted-foreground"
          >
            <TableCell>
              {{
                assignment.holder.displayName ?? assignment.holder.identifier
              }}
            </TableCell>
            <TableCell>{{ assignment.patternName }}</TableCell>
            <TableCell>
              {{ assignment.effectiveFrom.slice(0, 10) }} —
              {{ assignment.effectiveTo?.slice(0, 10) }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tugaskan Pola Kerja</DialogTitle>
          <DialogDescription>
            Penugasan sebelumnya ditutup sehari sebelum tanggal ini, sehingga
            rekap bulan lalu tetap dihitung dengan pola yang berlaku waktu itu.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3">
          <div class="space-y-1.5">
            <Label>Pegawai</Label>
            <Select v-model="form.userId">
              <SelectTrigger>
                <SelectValue placeholder="Pilih pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="employee in employees"
                  :key="employee.userId"
                  :value="employee.userId"
                >
                  {{ employee.name }} — {{ employee.identifier }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label>Pola kerja</Label>
            <Select v-model="form.workPatternId">
              <SelectTrigger>
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
            <Label for="assignment-from">Berlaku mulai</Label>
            <Input
              id="assignment-from"
              v-model="form.effectiveFrom"
              type="date"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="dialogOpen = false"
          >
            Batal
          </Button>
          <Button
            :disabled="saving || !form.userId || !form.workPatternId"
            @click="submit"
            >Simpan</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
