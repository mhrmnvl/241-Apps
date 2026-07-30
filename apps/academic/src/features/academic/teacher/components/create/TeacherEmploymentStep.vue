<script setup lang="ts">
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
import type { EmploymentTypeOption, PositionListItem } from '../../types'
import { positionCategoryLabel } from '../../utils'

defineProps<{
  employmentTypes: EmploymentTypeOption[]
  categoryOptions: { id: string; code: string; name: string }[]
  filteredPositions: PositionListItem[]
  kategori: string
  setFieldValue: (field: string, value: unknown) => void
}>()

const emit = defineEmits<(e: 'update:kategori', value: string) => void>()
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 items-start">
    <FormField
      v-slot="{ componentField }"
      name="nip"
    >
      <FormItem>
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
      <FormItem>
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
    <FormField
      v-slot="{ value, handleChange }"
      name="employmentTypeId"
    >
      <FormItem>
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
    <div class="space-y-2">
      <label class="text-sm font-medium">
        Kategori
        <span class="text-xs font-normal text-muted-foreground">(filter)</span>
      </label>
      <Select
        :model-value="kategori"
        @update:model-value="
          (v) => {
            emit('update:kategori', String(v ?? ''))
            setFieldValue('positionId', '')
          }
        "
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
      <FormItem class="md:col-span-2">
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
      </FormItem>
    </FormField>
  </div>
</template>
