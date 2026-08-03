<script setup lang="ts">
import { MasterDataListView } from '@/master-data'
import { useEducationConfig } from '../config'

const config = useEducationConfig()
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <MasterDataListView :config="config" />
  </div>
</template>
