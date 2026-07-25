<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { usePositionCategoryConfig } from '../config'

const config = usePositionCategoryConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Kategori Jabatan', href: '/setting/position-category' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
