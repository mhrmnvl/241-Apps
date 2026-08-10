<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import LeaveTypeFormDialog from '../components/LeaveTypeFormDialog.vue'
import {
  leaveTypeService,
  leaveTypes,
  loading,
} from '../services/leaveTypeService'
import { APPLIES_TO_LABEL, TREATMENT_LABEL } from '../types'
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

onMounted(() => void leaveTypeService.fetch())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Jenis Izin & Cuti</h1>
        <p class="text-muted-foreground text-sm">
          Sekolah yang memiliki daftar ini — tambahkan jenis baru tanpa perlu
          mengubah kode.
        </p>
      </div>
      <Button @click="startNew">
        <Plus class="mr-2 h-4 w-4" />
        Tambah
      </Button>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Perlakuan</TableHead>
          <TableHead>Berlaku untuk</TableHead>
          <TableHead class="text-right">Kuota</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="type in leaveTypes"
          :key="type.id"
        >
          <TableCell class="font-mono text-sm">{{ type.code }}</TableCell>
          <TableCell>
            {{ type.name }}
            <span
              v-if="type.requiresDocument"
              class="text-muted-foreground ml-1 text-xs"
            >
              (perlu surat)
            </span>
          </TableCell>
          <TableCell>
            <!-- Working elsewhere, not absent — the distinction that keeps a
                 dinas day out of the leave column in a recap. -->
            <Badge
              :variant="
                type.treatment === 'OFFICIAL_DUTY' ? 'outline' : 'secondary'
              "
            >
              {{ TREATMENT_LABEL[type.treatment] }}
            </Badge>
          </TableCell>
          <TableCell>{{ APPLIES_TO_LABEL[type.appliesTo] }}</TableCell>
          <TableCell class="text-right">
            {{ type.consumesQuota ? `${type.annualQuota ?? 0} hari` : '—' }}
          </TableCell>
          <TableCell>
            <Badge :variant="type.isActive ? 'default' : 'secondary'">
              {{ type.isActive ? 'Aktif' : 'Nonaktif' }}
            </Badge>
          </TableCell>
          <TableCell class="space-x-1 text-right">
            <Button
              variant="ghost"
              size="sm"
              @click="startEdit(type)"
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="remove(type)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>

        <TableRow v-if="!loading && leaveTypes.length === 0">
          <TableCell
            colspan="7"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada jenis izin.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <LeaveTypeFormDialog
      v-model:open="dialogOpen"
      :initial-data="editing"
      @success="leaveTypeService.fetch()"
    />
  </div>
</template>
