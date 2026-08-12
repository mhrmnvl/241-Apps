<script setup lang="ts">
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import LeaveTypeFormDialog from '../components/LeaveTypeFormDialog.vue'
import { createLeaveTypeColumns } from '../components/leaveTypeColumns'
import {
  leaveTypeService,
  leaveTypes,
  loading,
} from '../services/leaveTypeService'
import type { LeaveType } from '../types'

const dialogOpen = ref(false)
const editing = ref<LeaveType | null>(null)

function startNew() {
  editing.value = null
  dialogOpen.value = true
}

function startEdit(type: LeaveType) {
  editing.value = type
  dialogOpen.value = true
}

async function remove(type: LeaveType) {
  const confirmed = window.confirm(
    `Hapus "${type.name}"? Jika sudah dipakai pengajuan, nonaktifkan saja.`,
  )
  if (confirmed) await leaveTypeService.remove(type.id)
}

const tableColumns = computed(() =>
  createLeaveTypeColumns(startEdit, (type) => void remove(type)),
)

onMounted(() => void leaveTypeService.fetch())
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
          Jenis Izin & Cuti
        </CardTitle>
        <Button @click="startNew">
          <Plus class="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </CardHeader>

      <div class="p-6 space-y-4">
        <DataTable
          :columns="tableColumns"
          :data="leaveTypes"
          :is-loading="loading"
          item-label="jenis izin/cuti"
        />

        <LeaveTypeFormDialog
          v-model:open="dialogOpen"
          :initial-data="editing"
          @success="leaveTypeService.fetch()"
        />
      </div>
    </Card>
  </div>
</template>
