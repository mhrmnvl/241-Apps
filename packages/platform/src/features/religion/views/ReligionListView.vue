<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { MasterDataListView } from '@/master-data'
import { useReligionConfig } from '../config'

const config = useReligionConfig()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Agama', href: '/setting/religion' },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <MasterDataListView :config="config" />
    </div>
  </AppLayout>
</template>
