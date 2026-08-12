<script setup lang="ts">
import { AppCombobox, DataTable } from '@/ui'
import type { ComboboxOption } from '@/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Button, buttonVariants } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus, Users } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { salaryComponentService } from '../../component'
import AssignSalaryDialog from '../components/AssignSalaryDialog.vue'
import {
  createCurrentSalaryAssignmentColumns,
  createSupersededSalaryAssignmentColumns,
} from '../components/salaryAssignmentColumns'
import {
  currentAssignments,
  employees,
  loading,
  salaryAssignmentService,
  selectedUserId,
  supersededAssignments,
} from '../services/salaryAssignmentService'
import type { SalaryAssignment } from '../types'

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const deletingAssignment = ref<SalaryAssignment | null>(null)

const employeeOptions = computed<ComboboxOption[]>(() =>
  employees.value.map((employee) => ({
    value: employee.userId,
    label: employee.name,
  })),
)

function handleRequestRemove(assignment: SalaryAssignment) {
  deletingAssignment.value = assignment
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!deletingAssignment.value) return
  await salaryAssignmentService.remove(deletingAssignment.value)
  deleteDialogOpen.value = false
  deletingAssignment.value = null
}

const currentColumns = computed(() =>
  createCurrentSalaryAssignmentColumns((item) => handleRequestRemove(item)),
)

const supersededColumns = computed(() =>
  createSupersededSalaryAssignmentColumns(),
)

watch(selectedUserId, (userId) => {
  if (userId) void salaryAssignmentService.fetch(userId)
})

onMounted(async () => {
  await Promise.all([
    salaryAssignmentService.fetchEmployees(),
    salaryComponentService.fetch(),
  ])
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Gaji Pegawai
        </CardTitle>
        <Button
          :disabled="!selectedUserId"
          @click="dialogOpen = true"
        >
          <Plus class="mr-2 h-4 w-4" />
          Tetapkan Gaji
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <div class="w-full sm:w-70">
            <AppCombobox
              v-model="selectedUserId"
              :options="employeeOptions"
              placeholder="Pilih pegawai"
              search-placeholder="Cari nama pegawai..."
              empty-text="Pegawai tidak ditemukan."
            />
          </div>
        </div>

        <div
          v-if="!selectedUserId"
          class="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm"
        >
          <Users class="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
          <p class="font-medium text-foreground">Pilih Pegawai</p>
          <p class="text-xs text-muted-foreground mt-1">
            Pilih pegawai di atas untuk melihat dan mengelola rincian gaji.
          </p>
        </div>

        <template v-else>
          <div class="space-y-3">
            <DataTable
              :columns="currentColumns"
              :data="currentAssignments"
              :is-loading="loading"
              hide-pagination
              hide-per-page
              item-label="komponen gaji"
            />
          </div>

          <div
            v-if="supersededAssignments.length > 0"
            class="space-y-3 pt-4 border-t"
          >
            <h2
              class="text-base font-semibold tracking-tight text-muted-foreground"
            >
              Riwayat Penetapan Sebelumnya
            </h2>
            <DataTable
              :columns="supersededColumns"
              :data="supersededAssignments"
              :is-loading="loading"
              hide-pagination
              hide-per-page
              item-label="riwayat gaji"
            />
          </div>
        </template>

        <AssignSalaryDialog
          v-model:open="dialogOpen"
          :user-id="selectedUserId"
        />

        <AlertDialog v-model:open="deleteDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Penetapan Gaji?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus penetapan komponen "<span
                  class="font-medium text-foreground"
                  >{{ deletingAssignment?.component.name }}</span
                >"? Riwayat penetapan sebelumnya akan tetap tersimpan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                :class="buttonVariants({ variant: 'destructive' })"
                @click="confirmDelete"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  </div>
</template>
