<script setup lang="ts">
import { ref } from 'vue'
import TimeSlotManageTable from '../components/TimeSlotManageTable.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Loader2, Plus, Save } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'

const { can } = useRoleGuard()
const tableRef = ref<InstanceType<typeof TimeSlotManageTable> | null>(null)
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 flex flex-col gap-0"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4 shrink-0"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Jam Pelajaran
        </CardTitle>
        <Button
          v-if="can('time-slots.create')"
          class="w-full sm:w-auto"
          @click="tableRef?.addRow"
        >
          <Plus class="size-4 mr-2" />
          Tambah Baris
        </Button>
      </CardHeader>

      <div class="px-6 py-6 md:py-8">
        <TimeSlotManageTable
          ref="tableRef"
          :can-edit="can('time-slots.update')"
        />
      </div>

      <!-- Action Footer placed as standard Card footer -->
      <div
        v-if="can('time-slots.update')"
        class="flex justify-end items-center gap-2 border-t px-6 py-4 bg-background"
      >
        <Button
          :disabled="!tableRef?.hasChanges || tableRef?.loading"
          @click="tableRef?.saveAll"
        >
          <Loader2
            v-if="tableRef?.loading"
            class="size-4 mr-2 animate-spin"
          />
          <Save
            v-else
            class="size-4 mr-2"
          />
          Simpan
        </Button>
      </div>
    </Card>
  </div>
</template>
