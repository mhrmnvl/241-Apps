<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { onMounted, ref } from 'vue'
import { MONTH_NAMES } from '../../shared/money'
import PayslipCard from '../components/PayslipCard.vue'
import {
  loading,
  notYetPublished,
  payslip,
  payslipService,
} from '../services/payslipService'

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() === 0 ? 12 : now.getMonth())

const years = Array.from({ length: 5 }, (_, index) => now.getFullYear() - index)

function load() {
  void payslipService.fetchMine({ year: year.value, month: month.value })
}

onMounted(() => void payslipService.fetchMine())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex flex-wrap items-end gap-2">
      <Select v-model="month">
        <SelectTrigger class="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="(name, index) in MONTH_NAMES"
            :key="name"
            :value="index + 1"
          >
            {{ name }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="year">
        <SelectTrigger class="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in years"
            :key="option"
            :value="option"
          >
            {{ option }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        :disabled="loading"
        @click="load"
      >
        Tampilkan
      </Button>
    </div>

    <PayslipCard
      v-if="payslip"
      :payslip="payslip"
    />

    <!-- Only approved runs are visible here: a draft is still being
         recalculated, and a figure that later moves is worse than none. -->
    <div
      v-else-if="notYetPublished"
      class="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm"
    >
      Slip gaji periode ini belum terbit.
    </div>

    <div
      v-else-if="loading"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      Memuat…
    </div>
  </div>
</template>
