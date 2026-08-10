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
import SalaryComponentFormDialog from '../components/SalaryComponentFormDialog.vue'
import {
  components,
  loading,
  salaryComponentService,
} from '../services/salaryComponentService'
import { COMPONENT_TYPE_LABEL, DRIVER_LABEL } from '../types'
import type { SalaryComponent } from '../types'

const dialogOpen = ref(false)
const editing = ref<SalaryComponent | null>(null)

function startNew() {
  editing.value = null
  dialogOpen.value = true
}

function startEdit(component: SalaryComponent) {
  editing.value = component
  dialogOpen.value = true
}

async function remove(component: SalaryComponent) {
  const confirmed = window.confirm(
    `Hapus "${component.name}"? Jika sudah dipakai penetapan gaji, nonaktifkan saja.`,
  )
  if (confirmed) await salaryComponentService.remove(component.id)
}

onMounted(() => void salaryComponentService.fetch())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Komponen Gaji</h1>
        <p class="text-muted-foreground text-sm">
          Daftar komponen yang bisa ditetapkan ke pegawai — tambahkan sendiri
          tanpa mengubah kode.
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
          <TableHead>Jenis</TableHead>
          <TableHead>Dasar perhitungan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="component in components"
          :key="component.id"
        >
          <TableCell class="font-mono text-sm">{{ component.code }}</TableCell>
          <TableCell>{{ component.name }}</TableCell>
          <TableCell>
            <!-- Potongan mengurangi; sisanya menambah. -->
            <Badge
              :variant="
                component.type === 'DEDUCTION' ? 'destructive' : 'secondary'
              "
            >
              {{ COMPONENT_TYPE_LABEL[component.type] }}
            </Badge>
          </TableCell>
          <TableCell class="text-muted-foreground text-sm">
            {{ component.driver ? DRIVER_LABEL[component.driver] : 'Tetap' }}
          </TableCell>
          <TableCell>
            <Badge :variant="component.isActive ? 'default' : 'secondary'">
              {{ component.isActive ? 'Aktif' : 'Nonaktif' }}
            </Badge>
          </TableCell>
          <TableCell class="space-x-1 text-right">
            <Button
              variant="ghost"
              size="sm"
              @click="startEdit(component)"
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              @click="remove(component)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>

        <TableRow v-if="!loading && components.length === 0">
          <TableCell
            colspan="6"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada komponen gaji.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <SalaryComponentFormDialog
      v-model:open="dialogOpen"
      :initial-data="editing"
      @success="salaryComponentService.fetch()"
    />
  </div>
</template>
