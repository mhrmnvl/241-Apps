<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
import { religionApi } from '@/features/platform/religion/api/religionApi'
import { bloodTypeApi } from '@/features/platform/blood-type/api/bloodTypeApi'

const religions = ref<{ id: string; name: string }[]>([])
const bloodTypes = ref<{ id: string; name: string }[]>([])

onMounted(async () => {
  try {
    const [religionRes, bloodTypeRes] = await Promise.all([
      religionApi.getReligions({ limit: 100, isActive: true }),
      bloodTypeApi.getBloodTypes({ limit: 100, isActive: true }),
    ])
    religions.value = religionRes.data?.data ?? []
    bloodTypes.value = bloodTypeRes.data?.data ?? []
  } catch (error) {
    console.error('Gagal memuat data master untuk profil:', error)
  }
})
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 p-1">
    <FormField
      v-slot="{ componentField }"
      name="email"
    >
      <FormItem class="content-start">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="example@mail.com"
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
      <FormItem class="content-start">
        <FormLabel>No. Handphone</FormLabel>
        <FormControl>
          <Input
            placeholder="0812xxxx"
            maxlength="15"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="bloodTypeId"
    >
      <FormItem class="content-start">
        <FormLabel>Golongan Darah</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Gol. Darah" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Tahu / Kosong </SelectItem>
            <SelectItem
              v-for="bt in bloodTypes"
              :key="bt.id"
              :value="bt.id"
            >
              {{ bt.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="religionId"
    >
      <FormItem class="content-start">
        <FormLabel>Agama</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Agama" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Diisi / Kosong </SelectItem>
            <SelectItem
              v-for="rel in religions"
              :key="rel.id"
              :value="rel.id"
            >
              {{ rel.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="maritalStatus"
    >
      <FormItem class="content-start">
        <FormLabel>Status Pernikahan</FormLabel>
        <Select v-bind="componentField">
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Diisi / Kosong </SelectItem>
            <SelectItem value="SINGLE"> Belum Menikah </SelectItem>
            <SelectItem value="MARRIED"> Menikah </SelectItem>
            <SelectItem value="DIVORCED"> Cerai Hidup </SelectItem>
            <SelectItem value="WIDOWED"> Cerai Mati </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="kk"
    >
      <FormItem class="content-start">
        <FormLabel>No. Kartu Keluarga (KK)</FormLabel>
        <FormControl>
          <Input
            placeholder="16 digit"
            maxlength="16"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField
      v-slot="{ componentField }"
      name="npwp"
    >
      <FormItem class="content-start">
        <FormLabel>NPWP</FormLabel>
        <FormControl>
          <Input
            placeholder="Format NPWP"
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </div>
</template>
