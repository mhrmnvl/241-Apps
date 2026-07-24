<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { religionApi } from '@/features/platform/religion/api/religionApi'
import { bloodTypeApi } from '@/features/platform/blood-type/api/bloodTypeApi'
import type {
  ProfileDisplayData,
  UserGender,
  MaritalStatus,
  RawProfileData,
  ProfileUpdatePayload,
} from '../types'

const props = defineProps<{
  data: ProfileDisplayData
  rawProfile?: RawProfileData | null
  isEditable: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: [payload: ProfileUpdatePayload]
}>()

const religions = ref<{ id: string; name: string }[]>([])
const bloodTypes = ref<{ id: string; name: string }[]>([])

const form = reactive({
  name: '',
  nik: '',
  gender: undefined as UserGender | undefined,
  birthPlace: '',
  birthDate: '',
  email: '',
  phone: '',
  bloodTypeId: undefined as string | undefined,
  religionId: undefined as string | undefined,
  maritalStatus: undefined as MaritalStatus | undefined,
  kk: '',
  npwp: '',
})

watch(
  () => props.rawProfile,
  (data) => {
    if (data) {
      form.name = data.name ?? ''
      form.nik = data.nik ?? ''
      form.gender = data.gender ?? undefined
      form.birthPlace = data.birthPlace ?? ''
      form.birthDate = data.birthDate
        ? String(data.birthDate).substring(0, 10)
        : ''
      form.email = data.email ?? ''
      form.phone = data.phone ?? ''
      form.bloodTypeId = data.bloodTypeId ?? data.bloodType?.id ?? undefined
      form.religionId = data.religionId ?? data.religion?.id ?? undefined
      form.maritalStatus = data.maritalStatus ?? undefined
      form.kk = data.noKk ?? ''
      form.npwp = data.npwp ?? ''
    }
  },
  { immediate: true },
)

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

function handleSubmit() {
  if (!props.isEditable) return
  const payload: ProfileUpdatePayload = {
    name: form.name,
    nik: form.nik,
    gender: form.gender,
    birthPlace: form.birthPlace,
    birthDate: form.birthDate,
    email: form.email === '' ? null : form.email,
    phone: form.phone === '' ? null : form.phone,
    bloodTypeId:
      !form.bloodTypeId || form.bloodTypeId === 'none'
        ? null
        : form.bloodTypeId,
    religionId:
      !form.religionId || form.religionId === 'none' ? null : form.religionId,
    maritalStatus:
      !form.maritalStatus || (form.maritalStatus as string) === 'none'
        ? null
        : form.maritalStatus,
    noKk: form.kk === '' ? null : form.kk,
    npwp: form.npwp === '' ? null : form.npwp,
  }
  emit('save', payload)
}
</script>

<template>
  <div class="py-4">
    <form
      class="space-y-4 animate-in fade-in-50 duration-200"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-6">
        <!-- SECTION 1: Identitas -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold tracking-tight text-foreground">
            Identitas
          </h4>
          <div class="grid gap-5 md:grid-cols-2">
            <!-- Nama Lengkap -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">
                Nama Lengkap
                <span
                  v-if="isEditable"
                  class="text-destructive"
                  >*</span
                >
              </label>
              <Input
                v-model="form.name"
                placeholder="John Doe"
                maxlength="100"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                required
              />
            </div>

            <!-- NIK -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">
                NIK
                <span
                  v-if="isEditable"
                  class="text-destructive"
                  >*</span
                >
              </label>
              <Input
                v-model="form.nik"
                placeholder="16 digit NIK"
                maxlength="16"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                required
              />
            </div>

            <!-- No. Kartu Keluarga -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >No. Kartu Keluarga</label
              >
              <Input
                v-model="form.kk"
                placeholder="16 digit No. KK"
                maxlength="16"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- NPWP -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">NPWP</label>
              <Input
                v-model="form.npwp"
                placeholder="NPWP"
                maxlength="20"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>
          </div>
        </div>

        <!-- SECTION 2: Biodata -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold tracking-tight text-foreground">
            Biodata
          </h4>
          <div class="grid gap-5 md:grid-cols-2">
            <!-- Tempat Lahir -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">
                Tempat Lahir
                <span
                  v-if="isEditable"
                  class="text-destructive"
                  >*</span
                >
              </label>
              <Input
                v-model="form.birthPlace"
                placeholder="Mis. Jakarta"
                maxlength="100"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                required
              />
            </div>

            <!-- Tanggal Lahir -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">
                Tanggal Lahir
                <span
                  v-if="isEditable"
                  class="text-destructive"
                  >*</span
                >
              </label>
              <Input
                v-model="form.birthDate"
                type="date"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                required
              />
            </div>

            <!-- Jenis Kelamin -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">
                Jenis Kelamin
                <span
                  v-if="isEditable"
                  class="text-destructive"
                  >*</span
                >
              </label>
              <Select
                v-model="form.gender"
                :disabled="!isEditable"
              >
                <SelectTrigger
                  class="w-full disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                >
                  <SelectValue placeholder="Pilih Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Laki-laki</SelectItem>
                  <SelectItem value="FEMALE">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Agama -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">Agama</label>
              <Select
                v-model="form.religionId"
                :disabled="!isEditable"
              >
                <SelectTrigger
                  class="w-full disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                >
                  <SelectValue placeholder="Pilih Agama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak Tahu / Kosong</SelectItem>
                  <SelectItem
                    v-for="r in religions"
                    :key="r.id"
                    :value="r.id"
                  >
                    {{ r.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Golongan Darah -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Golongan Darah</label
              >
              <Select
                v-model="form.bloodTypeId"
                :disabled="!isEditable"
              >
                <SelectTrigger
                  class="w-full disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                >
                  <SelectValue placeholder="Pilih Golongan Darah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak Tahu / Kosong</SelectItem>
                  <SelectItem
                    v-for="b in bloodTypes"
                    :key="b.id"
                    :value="b.id"
                  >
                    {{ b.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Status Pernikahan -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Status Pernikahan</label
              >
              <Select
                v-model="form.maritalStatus"
                :disabled="!isEditable"
              >
                <SelectTrigger
                  class="w-full disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                >
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak Tahu / Kosong</SelectItem>
                  <SelectItem value="SINGLE">Belum Menikah</SelectItem>
                  <SelectItem value="MARRIED">Menikah</SelectItem>
                  <SelectItem value="DIVORCED">Cerai Hidup</SelectItem>
                  <SelectItem value="WIDOWED">Cerai Mati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Kontak -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold tracking-tight text-foreground">
            Kontak
          </h4>
          <div class="grid gap-5 md:grid-cols-2">
            <!-- Email Pribadi -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Email Pribadi</label
              >
              <Input
                v-model="form.email"
                type="email"
                placeholder="example@mail.com"
                maxlength="255"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Nomor Telepon/HP -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Nomor Telepon/HP</label
              >
              <Input
                v-model="form.phone"
                placeholder="0812xxxx"
                maxlength="15"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        v-if="isEditable"
        class="flex justify-end gap-3 pt-4"
      >
        <Button
          type="submit"
          :disabled="isSaving"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </div>
    </form>
  </div>
</template>
