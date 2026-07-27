<script setup lang="ts">
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import type { AddressForm } from '../composables/useApplicationFormState'

defineProps<{
  editable: boolean
}>()

const address = defineModel<AddressForm>({ required: true })
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2 sm:col-span-2">
      <Label>Alamat (Jalan)</Label>
      <Input
        v-model="address.street"
        :disabled="!editable"
      />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>RT</Label>
        <Input
          v-model="address.rt"
          maxlength="5"
          :disabled="!editable"
        />
      </div>
      <div class="space-y-2">
        <Label>RW</Label>
        <Input
          v-model="address.rw"
          maxlength="5"
          :disabled="!editable"
        />
      </div>
    </div>
    <div class="space-y-2">
      <Label>Desa/Kelurahan</Label>
      <Input
        v-model="address.village"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Kecamatan</Label>
      <Input
        v-model="address.district"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Kota/Kabupaten</Label>
      <Input
        v-model="address.city"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Provinsi</Label>
      <Input
        v-model="address.province"
        :disabled="!editable"
      />
    </div>
    <div class="space-y-2">
      <Label>Kode Pos</Label>
      <Input
        v-model="address.postalCode"
        maxlength="10"
        :disabled="!editable"
      />
    </div>
  </div>
</template>
