<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useSemesterTypeConfig } from '../config'

const config = useSemesterTypeConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tipe Semester', href: '/setting/semester-type' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
