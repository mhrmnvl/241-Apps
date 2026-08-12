<script setup lang="ts">
import { DataTable } from '@/ui'
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
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import SalaryComponentFormDialog from '../components/SalaryComponentFormDialog.vue'
import { createSalaryComponentColumns } from '../components/salaryComponentColumns'
import {
  components,
  loading,
  salaryComponentService,
} from '../services/salaryComponentService'
import type { SalaryComponent } from '../types'

const dialogOpen = ref(false)
const editing = ref<SalaryComponent | null>(null)
const deleteDialogOpen = ref(false)
const deletingComponent = ref<SalaryComponent | null>(null)

function startNew() {
  editing.value = null
  dialogOpen.value = true
}

function startEdit(component: SalaryComponent) {
  editing.value = component
  dialogOpen.value = true
}

function handleRequestRemove(component: SalaryComponent) {
  deletingComponent.value = component
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  if (!deletingComponent.value) return
  await salaryComponentService.remove(deletingComponent.value.id)
  deleteDialogOpen.value = false
  deletingComponent.value = null
}

const tableColumns = computed(() =>
  createSalaryComponentColumns(
    (item) => startEdit(item),
    (item) => handleRequestRemove(item),
  ),
)

onMounted(() => void salaryComponentService.fetch())
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
          Komponen Gaji
        </CardTitle>
        <Button @click="startNew">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Komponen
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <DataTable
          :columns="tableColumns"
          :data="components"
          :is-loading="loading"
          item-label="komponen gaji"
        />
      </div>
    </Card>

    <SalaryComponentFormDialog
      v-model:open="dialogOpen"
      :initial-data="editing"
      @success="salaryComponentService.fetch()"
    />

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Komponen Gaji?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus komponen "<span
              class="font-medium text-foreground"
              >{{ deletingComponent?.name }}</span
            >"? Jika sudah dipakai penetapan gaji, pertimbangkan untuk
            menonaktifkannya saja.
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
</template>
