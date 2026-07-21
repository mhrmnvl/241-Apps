<script setup lang="ts">
import { ref } from 'vue'
import TimeSlotManageTable from '../components/TimeSlotManageTable.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Plus } from 'lucide-vue-next'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Jam Pelajaran', href: '/pembelajaran/jam-pelajaran' },
]

const { isAdmin } = useRoleGuard()
const tableRef = ref<InstanceType<typeof TimeSlotManageTable> | null>(null)
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <div class="space-y-1.5">
            <CardTitle class="text-2xl font-bold tracking-tight">
              Jam Pelajaran
            </CardTitle>
            <p class="text-sm text-muted-foreground">
              Atur daftar jam pelajaran langsung pada tabel — tambah, ubah, dan
              simpan per baris.
            </p>
          </div>
          <Button
            v-if="isAdmin"
            @click="tableRef?.addRow"
          >
            <Plus class="size-4 mr-2" />
            Tambah Baris
          </Button>
        </CardHeader>

        <div class="p-6">
          <TimeSlotManageTable
            ref="tableRef"
            :can-edit="isAdmin"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
