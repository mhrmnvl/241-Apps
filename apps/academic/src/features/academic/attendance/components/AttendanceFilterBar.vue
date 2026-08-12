<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import { ref, computed } from 'vue'
import { Filter } from 'lucide-vue-next'
import { DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'

const props = defineProps<{
  activeTab: 'input' | 'recap'
  semesterFilterOptions: FilterOption[]
  classroomFilterOptions: FilterOption[]
  monthOptions: FilterOption[]
  yearFilterOptions: FilterOption[]
}>()

const selectedSemesterId = defineModel<string>('selectedSemesterId', {
  default: '',
})
const selectedClassroomId = defineModel<string>('selectedClassroomId', {
  default: '',
})
const selectedDate = defineModel<string>('selectedDate', { default: '' })
const selectedMonth = defineModel<number>('selectedMonth', { default: 1 })
const selectedYear = defineModel<number>('selectedYear', {
  default: new Date().getFullYear(),
})

const isFilterDialogOpen = ref(false)

const selectedMonthStr = computed({
  get: () => String(selectedMonth.value),
  set: (val: string) => {
    selectedMonth.value = Number(val)
  },
})

const selectedYearStr = computed({
  get: () => String(selectedYear.value),
  set: (val: string) => {
    selectedYear.value = Number(val)
  },
})
</script>

<template>
  <div>
    <!-- Desktop Filter Bar -->
    <div class="hidden lg:block">
      <div class="flex flex-wrap items-center gap-3">
        <Select v-model="selectedSemesterId">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Pilih Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="s in semesterFilterOptions"
              :key="s.value"
              :value="s.value"
            >
              {{ s.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedClassroomId">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Pilih Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="c in classroomFilterOptions"
              :key="c.value"
              :value="c.value"
            >
              {{ c.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <DatePicker
          v-if="props.activeTab === 'input'"
          v-model="selectedDate"
          class="w-[160px]"
        />
        <template v-else>
          <Select v-model="selectedMonthStr">
            <SelectTrigger class="w-[130px]">
              <SelectValue placeholder="Pilih Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="m in monthOptions"
                :key="m.value"
                :value="m.value"
              >
                {{ m.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedYearStr">
            <SelectTrigger class="w-[110px]">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="y in yearFilterOptions"
                :key="y.value"
                :value="y.value"
              >
                {{ y.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </template>
      </div>
    </div>

    <!-- Mobile Filter Button -->
    <div class="flex lg:hidden items-center gap-2">
      <Button
        variant="outline"
        class="w-full relative justify-center"
        @click="isFilterDialogOpen = true"
      >
        <Filter class="size-4 mr-2" />
        Filter Kehadiran
      </Button>
    </div>

    <!-- Mobile Filter Dialog -->
    <Dialog v-model:open="isFilterDialogOpen">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
          <DialogTitle>Filter Kehadiran</DialogTitle>
          <DialogDescription class="sr-only">
            Saring data kehadiran berdasarkan semester, kelas, tanggal, bulan,
            atau tahun.
          </DialogDescription>
        </DialogHeader>

        <div class="p-6 space-y-4">
          <div class="grid gap-2">
            <Label>Semester</Label>
            <Select v-model="selectedSemesterId">
              <SelectTrigger>
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="s in semesterFilterOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label>Kelas</Label>
            <Select v-model="selectedClassroomId">
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="c in classroomFilterOptions"
                  :key="c.value"
                  :value="c.value"
                >
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div
            v-if="props.activeTab === 'input'"
            class="grid gap-2"
          >
            <Label>Tanggal</Label>
            <DatePicker v-model="selectedDate" />
          </div>
          <template v-else>
            <div class="grid gap-2">
              <Label>Bulan</Label>
              <Select v-model="selectedMonthStr">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="m in monthOptions"
                    :key="m.value"
                    :value="m.value"
                  >
                    {{ m.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label>Tahun</Label>
              <Select v-model="selectedYearStr">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="y in yearFilterOptions"
                    :key="y.value"
                    :value="y.value"
                  >
                    {{ y.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </template>
        </div>

        <DialogFooter
          class="p-6 border-t bg-muted/10 flex items-center justify-end gap-2 shrink-0"
        >
          <Button
            class="w-full"
            @click="isFilterDialogOpen = false"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
