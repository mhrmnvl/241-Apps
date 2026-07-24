<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useEducationConfig } from '../config'

const config = useEducationConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tingkat Pendidikan', href: '/setting/education-level' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
