<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Plus } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import type { AdmissionWaveSummary } from '../types'
import { formatDate, formatIDR } from '../utils'

const waves = ref<AdmissionWaveSummary[]>([])
const loading = ref(false)
const isSaving = ref(false)
const isFormOpen = ref(false)
const selectedWave = ref<AdmissionWaveSummary | null>(null)

const breadcrumbs = [
  { title: 'Admin PSB', href: '/admin' },
  { title: 'Gelombang' },
]

const form = ref({
  name: '',
  code: '',
  academicYearId: '',
  startDate: '',
  endDate: '',
  quota: '100',
  registrationFee: '250000',
  description: '',
  isActive: true,
})

const columns = computed<ColumnDef<AdmissionWaveSummary>[]>(() => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
  },
  { accessorKey: 'code', header: 'Kode' },
  { accessorKey: 'name', header: 'Nama' },
  {
    id: 'period',
    header: 'Periode',
    cell: ({ row }) =>
      `${formatDate(row.original.startDate)} — ${formatDate(row.original.endDate)}`,
  },
  {
    id: 'quota',
    header: 'Kuota',
    cell: ({ row }) =>
      `${row.original._count?.applications ?? 0} / ${row.original.quota}`,
  },
  {
    id: 'fee',
    header: 'Biaya',
    cell: ({ row }) => formatIDR(Number(row.original.registrationFee)),
  },
  {
    id: 'isActive',
    header: 'Status',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isActive ? 'default' : 'secondary' },
        () => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
      ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) =>
      h(ActionCell, {
        onEdit: () => openEditForm(row.original),
        onDelete: () => deleteWave(row.original.id),
      }),
    enableSorting: false,
  },
])

async function fetchWaves() {
  loading.value = true
  try {
    const response = await admissionApi.getWaves({ limit: 100 })
    waves.value = response.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat gelombang.'))
  } finally {
    loading.value = false
  }
}

onMounted(fetchWaves)

function openCreateForm() {
  selectedWave.value = null
  const inheritedAcademicYearId =
    waves.value[0] &&
    typeof waves.value[0].academicYear === 'object' &&
    waves.value[0].academicYear
      ? waves.value[0].academicYear.id
      : ''
  form.value = {
    name: '',
    code: '',
    academicYearId: inheritedAcademicYearId,
    startDate: '',
    endDate: '',
    quota: '100',
    registrationFee: '250000',
    description: '',
    isActive: true,
  }
  isFormOpen.value = true
}

function openEditForm(wave: AdmissionWaveSummary) {
  selectedWave.value = wave
  form.value = {
    name: wave.name,
    code: wave.code,
    academicYearId:
      typeof wave.academicYear === 'object' && wave.academicYear
        ? wave.academicYear.id
        : '',
    startDate: wave.startDate.slice(0, 10),
    endDate: wave.endDate.slice(0, 10),
    quota: String(wave.quota),
    registrationFee: String(Number(wave.registrationFee)),
    description: wave.description ?? '',
    isActive: wave.isActive ?? true,
  }
  isFormOpen.value = true
}

async function saveWave() {
  if (
    !form.value.name.trim() ||
    !form.value.code.trim() ||
    !form.value.startDate ||
    !form.value.endDate
  ) {
    toast.error('Nama, kode, dan periode wajib diisi.')
    return
  }
  if (!selectedWave.value && !form.value.academicYearId) {
    toast.error(
      'ID tahun ajaran wajib diisi (salin dari gelombang yang sudah ada).',
    )
    return
  }

  isSaving.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      code: form.value.code.trim(),
      academicYearId: form.value.academicYearId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      quota: Number(form.value.quota) || 1,
      registrationFee: Number(form.value.registrationFee) || 0,
      description: form.value.description || undefined,
      isActive: form.value.isActive,
    }
    if (selectedWave.value) {
      await admissionApi.updateWave(selectedWave.value.id, payload)
      toast.success('Gelombang berhasil diperbarui.')
    } else {
      await admissionApi.createWave(payload)
      toast.success('Gelombang baru berhasil dibuat.')
    }
    isFormOpen.value = false
    await fetchWaves()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menyimpan gelombang.'))
  } finally {
    isSaving.value = false
  }
}

async function deleteWave(id: string) {
  if (!window.confirm('Hapus gelombang ini?')) return
  try {
    await admissionApi.deleteWave(id)
    toast.success('Gelombang dihapus.')
    await fetchWaves()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus gelombang.'))
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="space-y-4 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>Gelombang Pendaftaran</CardTitle>
            <Button @click="openCreateForm">
              <Plus class="mr-1 h-4 w-4" />
              Tambah Gelombang
            </Button>
          </div>
        </CardHeader>
      </Card>

      <DataTable
        :columns="columns"
        :data="waves"
        :loading="loading"
      />

      <Sheet v-model:open="isFormOpen">
        <SheetContent class="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {{ selectedWave ? 'Ubah Gelombang' : 'Tambah Gelombang' }}
            </SheetTitle>
            <SheetDescription>
              Atur periode, kuota, dan biaya pendaftaran.
            </SheetDescription>
          </SheetHeader>

          <div class="space-y-4 px-4 py-4">
            <div class="space-y-2">
              <Label>Nama</Label>
              <Input
                v-model="form.name"
                placeholder="Gelombang 1 — 2026/2027"
              />
            </div>
            <div class="space-y-2">
              <Label>Kode</Label>
              <Input
                v-model="form.code"
                placeholder="G1-2026"
              />
            </div>
            <div
              v-if="!selectedWave"
              class="space-y-2"
            >
              <Label>ID Tahun Ajaran</Label>
              <Input
                v-model="form.academicYearId"
                placeholder="UUID tahun ajaran"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Mulai</Label>
                <Input
                  v-model="form.startDate"
                  type="date"
                />
              </div>
              <div class="space-y-2">
                <Label>Selesai</Label>
                <Input
                  v-model="form.endDate"
                  type="date"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Kuota</Label>
                <Input
                  v-model="form.quota"
                  type="number"
                />
              </div>
              <div class="space-y-2">
                <Label>Biaya (Rp)</Label>
                <Input
                  v-model="form.registrationFee"
                  type="number"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                v-model="form.description"
                rows="3"
              />
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="form.isActive"
                type="checkbox"
              />
              Aktif
            </label>
          </div>

          <SheetFooter>
            <Button
              :disabled="isSaving"
              @click="saveWave"
            >
              {{ isSaving ? 'Menyimpan…' : 'Simpan' }}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </AppLayout>
</template>
