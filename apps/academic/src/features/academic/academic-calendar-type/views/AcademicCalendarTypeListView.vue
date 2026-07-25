<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useAcademicCalendarTypeConfig } from '../config'

const config = useAcademicCalendarTypeConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tipe Kalender', href: '/setting/academic-calendar-type' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
