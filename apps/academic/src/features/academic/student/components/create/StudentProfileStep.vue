<script setup lang="ts">
import { DatePicker } from '@/ui'
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
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 items-start">
    <FormField
      v-slot="{ componentField }"
      name="name"
    >
      <FormItem class="md:col-span-2">
        <FormLabel
          >Nama Lengkap <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <Input
            placeholder="Masukkan nama lengkap"
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
      <FormItem>
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
      v-slot="{ value, handleChange }"
      name="gender"
    >
      <FormItem>
        <FormLabel
          >Jenis Kelamin <span class="text-destructive">*</span></FormLabel
        >
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih jenis kelamin" />
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
      <FormItem>
        <FormLabel
          >Tempat Lahir <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <Input
            placeholder="Kota lahir"
            maxlength="100"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ value, handleChange }"
      name="birthDate"
    >
      <FormItem>
        <FormLabel
          >Tanggal Lahir <span class="text-destructive">*</span></FormLabel
        >
        <FormControl>
          <DatePicker
            :model-value="value"
            placeholder="Pilih tanggal lahir"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="email"
    >
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="contoh@email.com (opsional)"
            maxlength="255"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="phone"
    >
      <FormItem>
        <FormLabel>No. HP</FormLabel>
        <FormControl>
          <Input
            placeholder="08123456789 (opsional)"
            maxlength="15"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
