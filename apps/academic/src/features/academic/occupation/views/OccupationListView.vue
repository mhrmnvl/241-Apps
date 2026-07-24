<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useOccupationConfig } from '../config'

const config = useOccupationConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Pekerjaan', href: '/setting/occupation' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
