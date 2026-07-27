<script setup lang="ts">
import { Input } from '@/ui/input'
import type { AddressFormState } from '../types'

const address = defineModel<AddressFormState>({ required: true })
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 items-start">
    <div class="md:col-span-2 space-y-2">
      <label class="text-sm font-medium">Jalan / Alamat</label>
      <Input
        v-model="address.street"
        placeholder="Nama jalan, nomor rumah"
      />
    </div>
    <div class="grid grid-cols-2 gap-3 md:col-span-2">
      <div class="space-y-2">
        <label class="text-sm font-medium">RT</label>
        <Input
          v-model="address.rt"
          placeholder="RT"
        />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">RW</label>
        <Input
          v-model="address.rw"
          placeholder="RW"
        />
      </div>
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Desa / Kelurahan</label>
      <Input
        v-model="address.village"
        placeholder="Desa / kelurahan"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Kecamatan</label>
      <Input
        v-model="address.district"
        placeholder="Kecamatan"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Kota / Kabupaten</label>
      <Input
        v-model="address.city"
        placeholder="Kota / kabupaten"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Provinsi</label>
      <Input
        v-model="address.province"
        placeholder="Provinsi"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Kode Pos</label>
      <Input
        v-model="address.postalCode"
        placeholder="Kode pos"
      />
    </div>
    <div class="space-y-2">
      <label class="text-sm font-medium">Negara</label>
      <Input
        v-model="address.country"
        placeholder="Negara"
      />
    </div>
  </div>
</template>
