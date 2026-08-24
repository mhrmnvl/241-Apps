<script setup lang="ts">
import type { RolloverSemesterPayload, Semester } from '../types'
import RolloverSemesterDialog from '../components/RolloverSemesterDialog.vue'
import SemesterFormDialog from '../components/SemesterFormDialog.vue'
import { createSemesterColumns } from '../components/columns'
import { useSemesterList } from '../composables/useSemesterList'
import { useSemesterRollover } from '../composables/useSemesterRollover'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
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
import { useRoleGuard } from '@/features/platform/auth'
import { Copy, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import {
  suggestRollover,
  type RolloverSuggestion,
} from '../logic/suggestRollover'
import { toast } from 'vue-sonner'

const {
  semesters,
  loading,
  fetchSemesters,
  fetchSemesterTypes,
  deleteSemester,
  activateSemester,
  deactivateSemester,
} = useSemesterList()

const { isRollingOver, rolloverSummary, rolloverSemester } =
  useSemesterRollover()

const isAddModalOpen = ref(false)
const isRolloverModalOpen = ref(false)
const editingItem = ref<Semester | null>(null)
const { can } = useRoleGuard()

const confirmAction = ref<{
  type: 'activate' | 'deactivate'
  item: Semester
} | null>(null)
const isProcessing = ref(false)

const tableColumns = createSemesterColumns({
  showActions: can('semesters.update') || can('semesters.delete'),
  canUpdate: can('semesters.update'),
  canDelete: can('semesters.delete'),
  onEdit: (semester: Semester) => {
    editingItem.value = semester
    isAddModalOpen.value = true
  },
  onDelete: async (semester: Semester, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteSemester(semester.id)
    if (result.success) {
      await fetchSemesters()
      closeAlert()
    }
    setLoading(false)
  },
  onActivate: (semester: Semester) => {
    confirmAction.value = { type: 'activate', item: semester }
  },
  onDeactivate: (semester: Semester) => {
    confirmAction.value = { type: 'deactivate', item: semester }
  },
})

async function handleRollover(payload: RolloverSemesterPayload) {
  const result = await rolloverSemester(payload)
  if (result.success) {
    toast.success('Penyalinan data semester berhasil!')
    await fetchSemesters()
  }
}

/**
 * Offered after activating a term that turns out to be empty.
 *
 * Forgetting the rollover does not look like a missed step — it looks like a
 * broken screen, because every list scoped to the active term comes back
 * empty. Asking here, at the moment the omission happens, is what stops that
 * being discovered later.
 */
const rolloverSuggestion = ref<RolloverSuggestion | null>(null)

async function handleConfirmAction() {
  if (!confirmAction.value) return
  isProcessing.value = true
  const { type, item } = confirmAction.value
  const result =
    type === 'activate'
      ? await activateSemester(item.id)
      : await deactivateSemester(item.id)
  if (result.success) {
    await fetchSemesters()
    if (type === 'activate') {
      // Read from the refetched list, not from the row that was clicked: the
      // counts on that row are as stale as the click.
      const activated = semesters.value.find((s) => s.id === item.id)
      rolloverSuggestion.value = suggestRollover(activated, semesters.value)
    }
  }
  isProcessing.value = false
  confirmAction.value = null
}

async function acceptRolloverSuggestion() {
  const suggestion = rolloverSuggestion.value
  if (!suggestion) return

  rolloverSuggestion.value = null
  await handleRollover({
    sourceSemesterId: suggestion.source.id,
    targetSemesterId: suggestion.target.id,
  })
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
  }
})

watch(isRolloverModalOpen, (isOpen) => {
  if (!isOpen) {
    rolloverSummary.value = null
  }
})

onMounted(() => {
  void fetchSemesters()
  void fetchSemesterTypes()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Semester
        </CardTitle>
        <div
          v-if="can('semesters.create')"
          class="flex w-full items-center justify-end gap-2 sm:w-auto"
        >
          <Button
            variant="outline"
            @click="isRolloverModalOpen = true"
          >
            <Copy class="size-4 mr-2" />
            Salin Data
          </Button>
          <Button @click="isAddModalOpen = true">
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </div>
      </CardHeader>

      <div class="p-6 space-y-4">
        <DataTable
          :columns="tableColumns"
          :data="semesters"
          :is-loading="loading"
          item-label="semester"
          filter-column="type"
          filter-placeholder="Cari semester (Ganjil/Genap)..."
        />

        <SemesterFormDialog
          v-if="isAddModalOpen"
          v-model:open="isAddModalOpen"
          :edit-data="editingItem"
          @save-success="fetchSemesters"
        />

        <RolloverSemesterDialog
          v-if="can('semesters.create')"
          v-model:open="isRolloverModalOpen"
          :semesters="semesters"
          :is-rolling-over="isRollingOver"
          :rollover-summary="rolloverSummary"
          @rollover="handleRollover"
        />
      </div>
    </Card>
  </div>

  <AlertDialog :open="!!confirmAction">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{
            confirmAction?.type === 'activate'
              ? 'Aktifkan Semester?'
              : 'Nonaktifkan Semester?'
          }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {{
            confirmAction?.type === 'activate'
              ? 'Mengaktifkan semester ini akan menonaktifkan semua semester lainnya. Tahun ajaran terkait harus sudah aktif. Lanjutkan?'
              : 'Apakah Anda yakin ingin menonaktifkan semester ini?'
          }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="isProcessing"
          @click="confirmAction = null"
        >
          Batal
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isProcessing"
          @click="handleConfirmAction"
        >
          {{ isProcessing ? 'Memproses...' : 'Ya, Lanjutkan' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Asked where the omission happens. A term activated while empty makes
       every list scoped to it come back empty, which reads as a broken screen
       rather than as a step nobody took yet. -->
  <AlertDialog :open="rolloverSuggestion !== null">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle
          >Salin data dari semester sebelumnya?</AlertDialogTitle
        >
        <AlertDialogDescription>
          Semester yang baru diaktifkan belum punya data sama sekali. Salin
          kelas, siswa, wali kelas, penugasan mengajar, dan jadwal dari
          <strong
            >{{ rolloverSuggestion?.source.academicYear?.name }}
            {{
              rolloverSuggestion?.source.type?.name === 'ODD'
                ? 'Ganjil'
                : 'Genap'
            }}</strong
          >? Tanpa ini, layar yang mengikuti semester aktif akan tampak kosong.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :disabled="isRollingOver"
          @click="rolloverSuggestion = null"
        >
          Nanti Saja
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isRollingOver"
          @click="acceptRolloverSuggestion"
        >
          {{ isRollingOver ? 'Menyalin...' : 'Ya, Salin' }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
