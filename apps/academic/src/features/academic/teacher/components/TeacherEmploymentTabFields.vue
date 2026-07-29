<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import type {
  EmploymentTypeOption,
  PositionCategoryRef,
  PositionListItem,
} from '../types'
import { positionCategoryLabel } from '../utils'

defineProps<{
  employmentTypes: EmploymentTypeOption[]
  categoryOptions: PositionCategoryRef[]
  filteredPositions: PositionListItem[]
}>()

const emit = defineEmits<{
  'category-select': []
}>()

const kategori = defineModel<string>({ required: true })

function onCategorySelect(value: AcceptableValue) {
  kategori.value = typeof value === 'string' ? value : ''
  emit('category-select')
}
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 p-1">
    <FormField
      v-slot="{ componentField }"
      name="nip"
    >
      <FormItem class="content-start">
        <FormLabel>NIP</FormLabel>
        <FormControl>
          <Input
            placeholder="Masukkan NIP (opsional)"
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="nuptk"
    >
      <FormItem class="content-start">
        <FormLabel>NUPTK</FormLabel>
        <FormControl>
          <Input
            placeholder="Punya NUPTK? (opsional)"
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="space-y-2 content-start">
      <label class="text-sm font-medium leading-none">
        Kategori
        <span class="text-xs font-normal text-muted-foreground">(filter)</span>
      </label>
      <Select
        :model-value="kategori"
        @update:model-value="onCategorySelect"
      >
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Semua kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="cat in categoryOptions"
            :key="cat.id"
            :value="cat.id"
          >
            {{ positionCategoryLabel(cat.code, cat.name) }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <FormField
      v-slot="{ value, handleChange }"
      name="positionId"
    >
      <FormItem class="content-start">
        <FormLabel>
          Jabatan Utama
          <span class="text-xs font-normal text-muted-foreground"
            >(opsional)</span
          >
        </FormLabel>
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih jabatan..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem
              v-for="pos in filteredPositions"
              :key="pos.id"
              :value="pos.id"
            >
              {{ pos.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ value, handleChange }"
      name="employmentTypeId"
    >
      <FormItem class="content-start">
        <FormLabel
          >Status Kepegawaian <span class="text-destructive">*</span></FormLabel
        >
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih status saat ini" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem
              v-for="et in employmentTypes"
              :key="et.id"
              :value="et.id"
            >
              {{ et.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
