<script setup lang="ts">
import TimeSlotManageTable from '../components/TimeSlotManageTable.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Jam Pelajaran', href: '/pembelajaran/jam-pelajaran' },
]

const { isAdmin } = useRoleGuard()
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8 space-y-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Jam Pelajaran</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Atur daftar jam pelajaran langsung pada tabel — tambah, ubah, dan
          simpan per baris.
        </p>
      </div>

      <TimeSlotManageTable :can-edit="isAdmin" />
    </div>
  </AppLayout>
</template>
