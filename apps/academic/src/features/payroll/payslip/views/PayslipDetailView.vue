<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PayslipCard from '../components/PayslipCard.vue'
import { loading, payslip, payslipService } from '../services/payslipService'

const route = useRoute()

onMounted(() => void payslipService.fetchById(String(route.params.id)))
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <PayslipCard
      v-if="payslip"
      :payslip="payslip"
    />
    <div
      v-else-if="loading"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      Memuat…
    </div>
  </div>
</template>
