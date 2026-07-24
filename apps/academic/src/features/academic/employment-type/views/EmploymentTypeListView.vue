<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useEmploymentTypeConfig } from '../config'

const config = useEmploymentTypeConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Status Kepegawaian', href: '/setting/employment-type' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
