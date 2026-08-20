<script setup lang="ts">
import { Button } from '@/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  currentMonth: string
  currentYear: string
  months: string[]
  years: string[]
}>()

const emit = defineEmits<{
  prev: []
  next: []
  today: []
  'month-change': [val: string]
  'year-change': [val: string]
}>()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-4 mb-6"
  >
    <div class="flex items-center gap-1.5 sm:gap-2">
      <Button
        variant="outline"
        size="icon"
        title="Sebelumnya"
        @click="emit('prev')"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        title="Selanjutnya"
        @click="emit('next')"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        @click="emit('today')"
        >Hari Ini</Button
      >
    </div>

    <div class="flex items-center gap-1.5 sm:gap-2">
      <Select
        :model-value="currentMonth"
        @update:model-value="(val) => emit('month-change', String(val))"
      >
        <SelectTrigger class="w-[120px] sm:w-[140px]">
          <SelectValue placeholder="Pilih Bulan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="(month, idx) in months"
            :key="idx"
            :value="idx.toString()"
          >
            {{ month }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="currentYear"
        @update:model-value="(val) => emit('year-change', String(val))"
      >
        <SelectTrigger class="w-[100px]">
          <SelectValue placeholder="Pilih Tahun" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="year in years"
            :key="year"
            :value="year"
          >
            {{ year }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
