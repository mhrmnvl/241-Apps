<script setup lang="ts">
import { DatePicker } from '@/ui'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import type { FormContext } from 'vee-validate'

defineProps<{
  form: FormContext
}>()
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 p-1">
    <FormField
      v-slot="{ componentField }"
      name="name"
    >
      <FormItem class="md:col-span-2 content-start">
        <FormLabel
          >Nama Lengkap <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <Input
            placeholder="John Doe"
            maxlength="100"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="nik"
    >
      <FormItem class="content-start">
        <FormLabel>NIK <span class="text-destructive">*</span></FormLabel>
        <FormControl>
          <Input
            placeholder="16 digit NIK"
            maxlength="16"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="gender"
    >
      <FormItem class="content-start">
        <FormLabel
          >Jenis Kelamin <span class="text-destructive">*</span></FormLabel
        >
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Jenis Kelamin" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="MALE"> Laki-laki </SelectItem>
            <SelectItem value="FEMALE"> Perempuan </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="birthPlace"
    >
      <FormItem class="content-start">
        <FormLabel
          >Tempat Lahir <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <Input
            placeholder="Mis. Jakarta"
            maxlength="100"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ value, setValue }"
      name="birthDate"
    >
      <FormItem class="content-start">
        <FormLabel
          >Tanggal Lahir <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <DatePicker
            :model-value="value"
            placeholder="Pilih tanggal lahir"
            :has-error="!!form.errors.value.birthDate"
            @update:model-value="setValue"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
