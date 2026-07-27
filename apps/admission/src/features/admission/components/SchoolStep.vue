<script setup lang="ts">
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import type { SchoolForm } from '../composables/useApplicationFormState'

defineProps<{
  editable: boolean
}>()

const school = defineModel<SchoolForm>({ required: true })
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label>Nama Sekolah Asal</Label>
      <Input
        v-model="school.previousSchoolName"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>NPSN (opsional)</Label>
      <Input
        v-model="school.previousSchoolNpsn"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2 sm:col-span-2">
      <Label>Alamat Sekolah</Label>
      <Input
        v-model="school.previousSchoolAddress"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Tahun Lulus</Label>
      <Input
        v-model="school.graduationYear"
        type="number"
        :disabled="!editable"
      />
    </div>
  </div>
</template>
