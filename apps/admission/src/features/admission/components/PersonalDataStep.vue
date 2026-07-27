<script setup lang="ts">
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import type { PersonalForm } from '../composables/useApplicationFormState'

defineProps<{
  editable: boolean
}>()

const personal = defineModel<PersonalForm>({ required: true })
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>Nama Lengkap</Label>
      <Input
        v-model="personal.fullName"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Nama Panggilan</Label>
      <Input
        v-model="personal.nickname"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Jenis Kelamin</Label>
      <Select
        v-model="personal.gender"
        :disabled="!editable"
      >
        <SelectTrigger>
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MALE">Laki-laki</SelectItem>
          <SelectItem value="FEMALE">Perempuan</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="space-y-2">
      <Label>Tempat Lahir</Label>
      <Input
        v-model="personal.birthPlace"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Tanggal Lahir</Label>
      <Input
        v-model="personal.birthDate"
        type="date"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>NIK (16 digit)</Label>
      <Input
        v-model="personal.nik"
        maxlength="16"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>NISN (opsional)</Label>
      <Input
        v-model="personal.nisn"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>No. HP</Label>
      <Input
        v-model="personal.phone"
        :disabled="!editable"
      />
    </div>
  </div>
</template>
