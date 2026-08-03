<script setup lang="ts">
import { MasterDataListView } from '@/master-data'
import { useOccupationConfig } from '../config'

const config = useOccupationConfig()
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <MasterDataListView :config="config" />
  </div>
</template>
