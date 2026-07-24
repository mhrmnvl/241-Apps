<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useBloodTypeConfig } from '../config'

const config = useBloodTypeConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Golongan Darah', href: '/setting/blood-type' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
