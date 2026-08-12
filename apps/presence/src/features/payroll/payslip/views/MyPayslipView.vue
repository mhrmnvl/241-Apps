<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import { CalendarDays } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
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
const month = ref(now.getMonth() + 1)

const years = Array.from(
  { length: 5 },
  (_, index) => now.getFullYear() - 2 + index,
)

const selectedMonth = computed({
  get: () => String(month.value),
  set: (val: string) => {
    month.value = Number(val)
  },
})

const selectedYear = computed({
  get: () => String(year.value),
  set: (val: string) => {
    year.value = Number(val)
  },
})

function load() {
  void payslipService.fetchMine({ year: year.value, month: month.value })
}

watch([month, year], () => {
  load()
})

onMounted(() => void payslipService.fetchMine())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Slip Gaji Saya
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <Select v-model="selectedMonth">
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="(name, index) in MONTH_NAMES"
                :key="name"
                :value="String(index + 1)"
              >
                {{ name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedYear">
            <SelectTrigger class="w-[100px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in years"
                :key="option"
                :value="String(option)"
              >
                {{ option }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          v-if="loading"
          class="space-y-4 py-6"
        >
          <Skeleton class="h-8 w-64 rounded-md" />
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton
              v-for="i in 4"
              :key="i"
              class="h-16 rounded-xl"
            />
          </div>
          <Skeleton class="h-48 w-full rounded-xl" />
        </div>

        <PayslipCard
          v-else-if="payslip"
          :payslip="payslip"
        />

        <!-- Only approved runs are visible here: a draft is still being
             recalculated, and a figure that later moves is worse than none. -->
        <div
          v-else-if="notYetPublished"
          class="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm"
        >
          <CalendarDays class="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
          <p class="font-medium text-foreground">Slip Gaji Belum Terbit</p>
          <p class="text-xs text-muted-foreground mt-1">
            Slip gaji untuk periode ini belum disetujui atau terbit.
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
