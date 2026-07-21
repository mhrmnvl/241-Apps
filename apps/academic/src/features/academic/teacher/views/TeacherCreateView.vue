<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { Check, Plus, Trash2 } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/ui/stepper'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import api from '@/shared/utils/api'
import { teacherApi } from '../api/teacherApi'
import { teacherService } from '../services/teacherService'
import type {
  EmploymentTypeOption,
  PositionListItem,
  TeacherPositionInput,
} from '../types'

const router = useRouter()
const breadcrumbs = [
  { title: 'Guru', href: '/teacher' },
  { title: 'Tambah Guru' },
]

const steps = [
  { value: 1, title: 'Profil' },
  { value: 2, title: 'Kepegawaian' },
  { value: 3, title: 'Alamat' },
  { value: 4, title: 'Jabatan' },
  { value: 5, title: 'Ringkasan' },
]
const activeStep = ref(1)
const submitting = ref(false)

const employmentTypes = ref<EmploymentTypeOption[]>([])
const positions = ref<PositionListItem[]>([])
const kategori = ref('')

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Mohon masukkan nama lengkap guru.')
      .max(100, 'Nama tidak boleh lebih dari 100 karakter.'),
    nik: z
      .string()
      .min(1, 'Nomor Induk Kependudukan (NIK) wajib diisi.')
      .length(16, 'NIK harus berjumlah tepat 16 digit angka.'),
    gender: z.string().min(1, 'Silakan pilih jenis kelamin guru.'),
    birthPlace: z
      .string()
      .min(1, 'Kota tempat lahir wajib dicantumkan.')
      .max(100, 'Tempat lahir tidak boleh lebih dari 100 karakter.'),
    birthDate: z.string().min(1, 'Mohon tentukan tanggal lahir guru.'),
    email: z
      .string()
      .max(255)
      .email('Format alamat email tidak valid.')
      .optional()
      .or(z.literal('')),
    phone: z.string().max(15).optional().or(z.literal('')),
    nip: z.string().max(20).optional().or(z.literal('')),
    nuptk: z.string().max(20).optional().or(z.literal('')),
    employmentTypeId: z
      .string()
      .min(1, 'Silakan pilih status kepegawaian saat ini.'),
    positionId: z.string().optional().default(''),
  }),
)

const { values, validateField, setFieldValue } = useForm({
  validationSchema: formSchema,
  keepValuesOnUnmount: true,
  initialValues: {
    name: '',
    nik: '',
    gender: 'MALE',
    birthPlace: '',
    birthDate: '',
    email: '',
    phone: '',
    nip: '',
    nuptk: '',
    employmentTypeId: '',
    positionId: '',
  },
})

const filteredPositions = computed(() => {
  if (!kategori.value) return positions.value
  if (kategori.value === 'guru') {
    return positions.value.filter((p) => p.category === 'ACADEMIC')
  }
  return positions.value.filter((p) => p.category !== 'ACADEMIC')
})

const address = reactive({
  street: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Indonesia',
})
const hasAddress = computed(() => address.street.trim() !== '')

const extraPositions = ref<TeacherPositionInput[]>([])
function addPosition() {
  extraPositions.value.push({
    positionId: '',
    hireDate: new Date().toISOString().substring(0, 10),
    isPrimary: false,
  })
}
function removePosition(index: number) {
  extraPositions.value.splice(index, 1)
}

type FieldName = Parameters<typeof validateField>[0]
async function validateFields(fields: FieldName[]): Promise<boolean> {
  const results = await Promise.all(fields.map((f) => validateField(f)))
  return results.every((r) => r.valid)
}

const PROFIL_FIELDS: FieldName[] = [
  'name',
  'nik',
  'gender',
  'birthPlace',
  'birthDate',
]
const KEPEG_FIELDS: FieldName[] = ['employmentTypeId']

// Mundur bebas; maju (lewat tombol Lanjut MAUPUN klik stepper) selalu lewat gerbang validasi
async function goToStep(target: number) {
  if (target <= activeStep.value) {
    activeStep.value = target
    return
  }
  if (!(await validateFields(PROFIL_FIELDS))) {
    activeStep.value = 1
    return
  }
  if (target >= 3 && !(await validateFields(KEPEG_FIELDS))) {
    activeStep.value = 2
    return
  }
  activeStep.value = target
}

function next() {
  void goToStep(activeStep.value + 1)
}
function back() {
  if (activeStep.value === 1) {
    void router.push('/teacher')
    return
  }
  activeStep.value -= 1
}

function isValidPosition(p: TeacherPositionInput): boolean {
  return p.positionId !== '' && p.hireDate !== ''
}

async function submit() {
  if (!(await validateFields(PROFIL_FIELDS))) {
    activeStep.value = 1
    return
  }
  if (!(await validateFields(KEPEG_FIELDS))) {
    activeStep.value = 2
    return
  }
  if (hasAddress.value) {
    const required = [
      address.village,
      address.district,
      address.city,
      address.province,
      address.country,
    ]
    if (required.some((v) => v.trim() === '')) {
      activeStep.value = 3
      toast.error('Lengkapi alamat (desa, kecamatan, kota, provinsi, negara).')
      return
    }
  }
  const invalidPosition = extraPositions.value.find((p) => !isValidPosition(p))
  if (invalidPosition) {
    activeStep.value = 4
    toast.error('Lengkapi jabatan: pilih jabatan dan tanggal mulai.')
    return
  }

  submitting.value = true
  try {
    const result = await teacherService.createTeacherWithRelations({
      core: {
        name: values.name ?? '',
        nik: values.nik ?? '',
        gender: (values.gender ?? 'MALE') as 'MALE' | 'FEMALE',
        birthPlace: values.birthPlace ?? '',
        birthDate: values.birthDate ?? '',
        employmentTypeId: values.employmentTypeId ?? '',
        positionId: values.positionId ?? undefined,
        identifier: values.nip ?? values.nik ?? '',
        password: values.nip ?? values.nik ?? '',
        email: values.email ?? undefined,
        phone: values.phone ?? undefined,
        nip: values.nip ?? undefined,
        nuptk: values.nuptk ?? undefined,
      },
      address: hasAddress.value ? { ...address } : null,
      positions: extraPositions.value,
    })

    if (!result.success) {
      toast.error('Gagal menyimpan data guru. Periksa kembali isian Anda.')
      return
    }
    toast.success('Guru baru berhasil disimpan.')
    result.warnings.forEach((w) => toast.warning(w))
    if (result.userId) {
      void router.push(`/profile/TEACHER/${result.userId}`)
    } else {
      void router.push('/teacher')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const [empRes, posRes] = await Promise.all([
      api.get<{ data: EmploymentTypeOption[] }>('/employment-types', {
        params: { limit: 100 },
      }),
      teacherApi.getPositions({ limit: 100, isActive: true }),
    ])
    employmentTypes.value = empRes.data.data ?? []
    positions.value = posRes.data.data ?? []
  } catch (error: unknown) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data pilihan.'))
  }
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 py-0"
      >
        <CardHeader class="border-b px-6 pt-5! pb-5!">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Tambah Guru Baru
          </CardTitle>
        </CardHeader>

        <div class="px-6 py-4 border-b">
          <Stepper
            :model-value="activeStep"
            class="flex items-center justify-center gap-2 md:gap-6 w-full max-w-3xl mx-auto"
            @update:model-value="(v) => void goToStep(Number(v))"
          >
            <StepperItem
              v-for="step in steps"
              :key="step.value"
              :step="step.value"
              class="flex items-center gap-2 md:gap-6 group"
            >
              <StepperTrigger
                class="flex items-center gap-2 cursor-pointer outline-none"
              >
                <StepperIndicator class="shrink-0">
                  <Check
                    v-if="activeStep > step.value"
                    class="size-4"
                  />
                  <span v-else>{{ step.value }}</span>
                </StepperIndicator>
                <StepperTitle
                  class="text-sm font-semibold leading-none whitespace-nowrap hidden md:block"
                >
                  {{ step.title }}
                </StepperTitle>
              </StepperTrigger>
              <StepperSeparator
                v-if="step.value < steps.length"
                class="w-8 md:w-16 h-0.5 bg-muted"
              />
            </StepperItem>
          </Stepper>
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          <div class="px-6 py-5">
            <!-- Step 1: Profil -->
            <div
              v-show="activeStep === 1"
              class="grid gap-5 md:grid-cols-2 items-start"
            >
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem class="md:col-span-2">
                  <FormLabel
                    >Nama Lengkap
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Budi Santoso, S.Pd"
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
                  <FormLabel
                    >NIK <span class="text-destructive">*</span></FormLabel
                  >
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
                    >Jenis Kelamin
                    <span class="text-destructive">*</span></FormLabel
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
                    >Tempat Lahir
                    <span class="text-destructive">*</span></FormLabel
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
                    >Tanggal Lahir
                    <span class="text-destructive">*</span></FormLabel
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

            <!-- Step 2: Kepegawaian -->
            <div
              v-show="activeStep === 2"
              class="grid gap-5 md:grid-cols-2 items-start"
            >
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
                    >Status Kepegawaian
                    <span class="text-destructive">*</span></FormLabel
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
                <label class="text-sm font-medium"
                  >Kategori Jabatan Utama</label
                >
                <Select
                  v-model="kategori"
                  @update:model-value="setFieldValue('positionId', '')"
                >
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih kategori (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guru"> Guru </SelectItem>
                    <SelectItem value="tendik">
                      Tenaga Kependidikan
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
                    :disabled="!kategori"
                    @update:model-value="handleChange"
                  >
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue
                          :placeholder="
                            !kategori
                              ? 'Pilih kategori terlebih dahulu'
                              : 'Pilih jabatan utama'
                          "
                        />
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

            <!-- Step 3: Alamat (optional) -->
            <div v-if="activeStep === 3">
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
            </div>

            <!-- Step 4: Jabatan tambahan (optional) -->
            <div
              v-if="activeStep === 4"
              class="flex flex-col"
            >
              <div class="flex items-center justify-end -mt-3 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="h-8 shadow-xs gap-1.5"
                  @click="addPosition"
                >
                  <Plus class="size-3.5" />
                  Tambah Jabatan
                </Button>
              </div>

              <div class="max-h-[48vh] overflow-y-auto space-y-4 pr-1">
                <p
                  v-if="extraPositions.length === 0"
                  class="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded-xl bg-muted/5"
                >
                  Belum ada jabatan tambahan.
                </p>

                <template v-else>
                  <Card
                    v-for="(pos, index) in extraPositions"
                    :key="index"
                    class="overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:border-primary/20"
                  >
                    <CardHeader
                      class="flex flex-row items-center justify-between border-b px-5 py-3 bg-muted/20"
                    >
                      <CardTitle class="text-xs font-semibold">
                        Jabatan {{ index + 1 }}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-colors"
                        @click="removePosition(index)"
                      >
                        <Trash2 class="size-4" />
                      </Button>
                    </CardHeader>
                    <div class="p-5 grid gap-4 md:grid-cols-2 items-start">
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Jabatan</label>
                        <Select v-model="pos.positionId">
                          <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih jabatan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="p in positions"
                              :key="p.id"
                              :value="p.id"
                            >
                              {{ p.name }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Tanggal Mulai</label>
                        <Input
                          v-model="pos.hireDate"
                          type="date"
                        />
                      </div>
                    </div>
                  </Card>
                </template>
              </div>
            </div>

            <!-- Step 5: Ringkasan -->
            <div
              v-if="activeStep === 5"
              class="space-y-4 text-sm"
            >
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-2">Profil & Kepegawaian</p>
                <div class="grid gap-1 md:grid-cols-2 text-muted-foreground">
                  <span>Nama: {{ values.name || '-' }}</span>
                  <span>NIK: {{ values.nik || '-' }}</span>
                  <span>NIP: {{ values.nip || '-' }}</span>
                  <span>NUPTK: {{ values.nuptk || '-' }}</span>
                </div>
              </div>
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-1">Alamat</p>
                <p class="text-muted-foreground">
                  {{ hasAddress ? address.street : 'Dilewati' }}
                </p>
              </div>
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-1">Jabatan Tambahan</p>
                <p class="text-muted-foreground">
                  {{
                    extraPositions.length > 0
                      ? `${extraPositions.length} jabatan`
                      : 'Dilewati'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t px-6 py-4 bg-background"
        >
          <Button
            variant="outline"
            :disabled="submitting"
            @click="back"
          >
            {{ activeStep === 1 ? 'Batal' : 'Kembali' }}
          </Button>
          <Button
            v-if="activeStep < 5"
            @click="next"
          >
            Lanjut
          </Button>
          <Button
            v-else
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? 'Menyimpan...' : 'Simpan Guru' }}
          </Button>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
