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
import type { Classroom } from '@/features/academic/classroom'
import type { GradeOption } from '../../types'

defineProps<{
  grades: GradeOption[]
  filteredClassrooms: Classroom[]
  setFieldValue: (field: string, value: unknown) => void
}>()
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 items-start">
    <FormField
      v-slot="{ componentField }"
      name="nis"
    >
      <FormItem>
        <FormLabel>NIS <span class="text-destructive">*</span></FormLabel>
        <FormControl>
          <Input
            placeholder="Nomor Induk Siswa"
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="nisn"
    >
      <FormItem>
        <FormLabel>NISN <span class="text-destructive">*</span></FormLabel>
        <FormControl>
          <Input
            placeholder="Nomor Induk Siswa Nasional"
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ value, handleChange }"
      name="gradeId"
    >
      <FormItem>
        <FormLabel>Tingkat</FormLabel>
        <Select
          :model-value="value"
          @update:model-value="
            (val) => {
              handleChange(val)
              setFieldValue('classroomId', '')
            }
          "
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih tingkat (opsional)" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem
              v-for="lvl in grades"
              :key="lvl.id"
              :value="lvl.id"
            >
              {{ lvl.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ value, handleChange }"
      name="classroomId"
    >
      <FormItem>
        <FormLabel>Kelas</FormLabel>
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih kelas (opsional)" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem
              v-for="cls in filteredClassrooms"
              :key="cls.id"
              :value="cls.id"
            >
              {{ cls.displayName }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FormItem>
    </FormField>
  </div>
</template>
