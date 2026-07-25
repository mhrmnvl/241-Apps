<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useAchievementTypeConfig } from '../config'

const config = useAchievementTypeConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tingkat Prestasi', href: '/setting/achievement-type' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
