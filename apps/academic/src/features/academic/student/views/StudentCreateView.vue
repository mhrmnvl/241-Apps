<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
  StepperTrigger,
} from '@/ui/stepper'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { classroomApi, type Classroom } from '@/features/academic/classroom'
import { occupationApi } from '@/features/academic/occupation'
import type { IncomeRange } from '@/features/academic/parent'
import {
  AddressFields,
  useAddressSubform,
  useDynamicEntryList,
  useMultiStepForm,
} from '@/features/academic/shared/multi-step-form'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import { studentService } from '../services/studentService'
import type { GradeOption, StudentParentInput } from '../types'

const router = useRouter()
const breadcrumbs = [
  { title: 'Siswa', href: '/student' },
  { title: 'Tambah Siswa' },
]

const steps = [
  { value: 1, title: 'Profil' },
  { value: 2, title: 'Akademik' },
  { value: 3, title: 'Alamat' },
  { value: 4, title: 'Orang Tua' },
  { value: 5, title: 'Ringkasan' },
]

const grades = ref<GradeOption[]>([])
const classrooms = ref<Classroom[]>([])
const occupations = ref<{ id: string; name: string }[]>([])

const incomeOptions: { value: IncomeRange; label: string }[] = [
  { value: 'BELOW_500K', label: '< Rp 500.000' },
  { value: 'BETWEEN_500K_1M', label: 'Rp 500.000 - 1.000.000' },
  { value: 'BETWEEN_1M_2M', label: 'Rp 1.000.000 - 2.000.000' },
  { value: 'BETWEEN_2M_3M', label: 'Rp 2.000.000 - 3.000.000' },
  { value: 'ABOVE_3M', label: '> Rp 3.000.000' },
]
const relationOptions = [
  { value: 'FATHER', label: 'Ayah' },
  { value: 'MOTHER', label: 'Ibu' },
  { value: 'GUARDIAN', label: 'Wali' },
]

const formSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Mohon masukkan nama lengkap siswa.')
      .max(100, 'Nama tidak boleh lebih dari 100 karakter.'),
    nik: z
      .string()
      .min(1, 'Nomor Induk Kependudukan (NIK) wajib diisi.')
      .length(16, 'NIK harus berjumlah tepat 16 digit angka.'),
    gender: z.string().min(1, 'Silakan pilih jenis kelamin siswa.'),
    birthPlace: z
      .string()
      .min(1, 'Kota tempat lahir wajib dicantumkan.')
      .max(100, 'Tempat lahir tidak boleh lebih dari 100 karakter.'),
    birthDate: z.string().min(1, 'Mohon tentukan tanggal lahir siswa.'),
    email: z
      .string()
      .max(255)
      .email('Format alamat email tidak valid.')
      .optional()
      .or(z.literal('')),
    phone: z.string().max(15).optional().or(z.literal('')),
    nis: z
      .string()
      .max(20, 'NIS tidak boleh lebih dari 20 karakter.')
      .optional()
      .or(z.literal('')),
    nisn: z
      .string()
      .max(20, 'NISN tidak boleh lebih dari 20 karakter.')
      .optional()
      .or(z.literal('')),
    gradeId: z.string().optional().default(''),
    classroomId: z.string().optional().default(''),
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
    nis: '',
    nisn: '',
    gradeId: '',
    classroomId: '',
  },
})

const { address, hasAddress, validateAddress } = useAddressSubform()

const {
  items: parents,
  addItem: addParent,
  removeItem: removeParent,
} = useDynamicEntryList<StudentParentInput>((index) => ({
  relation: 'FATHER',
  name: '',
  nik: '',
  birthPlace: '',
  birthDate: '',
  email: '',
  phone: '',
  occupationId: '',
  income: undefined,
  isPrimary: index === 0,
}))

const filteredClassrooms = computed(() => {
  if (!values.gradeId) return classrooms.value
  return classrooms.value.filter(
    (c) =>
      c.gradeId === values.gradeId || c.classroomLevelId === values.gradeId,
  )
})

type FieldName = Parameters<typeof validateField>[0]
const PROFIL_FIELDS: FieldName[] = [
  'name',
  'nik',
  'gender',
  'birthPlace',
  'birthDate',
]
const AKADEMIK_FIELDS: FieldName[] = ['nis', 'nisn']

const {
  activeStep,
  submitting,
  mobileVisibleStepValues,
  goToStep,
  next,
  back,
  validateAllGates,
} = useMultiStepForm<FieldName>({
  steps,
  validateField,
  gates: [
    { fields: PROFIL_FIELDS, unlocksStep: 2 },
    { fields: AKADEMIK_FIELDS, unlocksStep: 3 },
  ],
  onCancel: () => void router.push('/student'),
})

function isValidParent(p: StudentParentInput): boolean {
  return (
    p.name.trim() !== '' &&
    /^\d{16}$/.test(p.nik) &&
    p.birthPlace.trim() !== '' &&
    p.birthDate !== '' &&
    p.occupationId !== '' &&
    p.relation !== ''
  )
}

async function submit() {
  if (!(await validateAllGates())) {
    return
  }
  if (!validateAddress()) {
    activeStep.value = 3
    toast.error('Lengkapi alamat (desa, kecamatan, kota, provinsi, negara).')
    return
  }
  const invalidParent = parents.value.find((p) => !isValidParent(p))
  if (invalidParent) {
    activeStep.value = 4
    toast.error(
      'Lengkapi data orang tua: nama, NIK 16 digit, TTL, pekerjaan, hubungan.',
    )
    return
  }

  submitting.value = true
  try {
    const result = await studentService.createStudentWithRelations({
      name: values.name ?? '',
      nik: values.nik ?? '',
      gender: values.gender ?? 'MALE',
      birthPlace: values.birthPlace ?? '',
      birthDate: values.birthDate ?? '',
      email: values.email || undefined,
      phone: values.phone || undefined,
      nis: values.nis || undefined,
      nisn: values.nisn || undefined,
      gradeId: values.gradeId || undefined,
      classroomId: values.classroomId || undefined,
      identifier: values.nis || undefined,
      password: values.nis || undefined,
      address: hasAddress.value ? { ...address.value } : null,
      parents: parents.value,
    })

    if (!result.success) {
      toast.error('Gagal menyimpan data siswa. Periksa kembali isian Anda.')
      return
    }
    toast.success('Siswa baru berhasil disimpan.')
    if (result.userId) {
      void router.push(`/profile/STUDENT/${result.userId}`)
    } else {
      void router.push('/student')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const [gradeRes, classroomRes, occupationRes] = await Promise.all([
      api.get<ApiPaginatedResponse<GradeOption>>('/grades', {
        params: { limit: 100, isActive: true },
      }),
      classroomApi.getClassrooms({ limit: 100, isActive: true }),
      occupationApi.getOccupations({ limit: 100 }),
    ])
    grades.value = gradeRes.data.data ?? []
    classrooms.value = classroomRes.data.data ?? []
    occupations.value = occupationRes.data.data ?? []
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
            Tambah Siswa Baru
          </CardTitle>
        </CardHeader>

        <div class="px-6 py-4 border-b">
          <Stepper
            :model-value="activeStep"
            class="flex items-center justify-center gap-1 sm:gap-2 w-full max-w-md mx-auto"
            @update:model-value="(v) => void goToStep(Number(v))"
          >
            <StepperItem
              v-for="step in steps"
              :key="step.value"
              :step="step.value"
              class="flex items-center gap-1 sm:gap-2 group transition-all duration-300"
              :class="{
                'hidden sm:flex': !mobileVisibleStepValues.includes(step.value),
              }"
            >
              <StepperTrigger
                class="flex items-center gap-1 sm:gap-2 cursor-pointer outline-none shrink-0"
              >
                <StepperIndicator class="shrink-0">
                  <Check
                    v-if="activeStep > step.value"
                    class="size-4"
                  />
                  <span v-else>{{ step.value }}</span>
                </StepperIndicator>
              </StepperTrigger>
              <StepperSeparator
                v-if="step.value < steps.length"
                class="w-3 sm:w-10 h-0.5 bg-muted transition-all duration-300"
                :class="{
                  'hidden sm:block': !(
                    mobileVisibleStepValues.includes(step.value) &&
                    mobileVisibleStepValues.includes(step.value + 1)
                  ),
                }"
              />
            </StepperItem>
          </Stepper>

          <div class="mt-3 text-center">
            <span
              class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Langkah {{ activeStep }} dari {{ steps.length }}
            </span>
            <p class="text-sm font-bold text-foreground">
              {{ steps.find((s) => s.value === activeStep)?.title }}
            </p>
          </div>
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          <div class="px-6 py-5">
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

            <div
              v-show="activeStep === 2"
              class="grid gap-5 md:grid-cols-2 items-start"
            >
              <FormField
                v-slot="{ componentField }"
                name="nis"
              >
                <FormItem>
                  <FormLabel
                    >NIS <span class="text-destructive">*</span></FormLabel
                  >
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
                  <FormLabel
                    >NISN <span class="text-destructive">*</span></FormLabel
                  >
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

            <!-- Step 3: Alamat (optional) -->
            <div v-if="activeStep === 3">
              <AddressFields v-model="address" />
            </div>

            <div
              v-if="activeStep === 4"
              class="flex flex-col"
            >
              <div class="flex items-center justify-end -mt-3 mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  class="h-8 shadow-xs gap-1.5"
                  @click="addParent"
                >
                  <Plus class="size-3.5" />
                  Tambah Orang Tua
                </Button>
              </div>

              <div class="max-h-[48vh] overflow-y-auto space-y-4 pr-1">
                <p
                  v-if="parents.length === 0"
                  class="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded-xl bg-muted/5"
                >
                  Belum ada data orang tua.
                </p>

                <template v-else>
                  <Card
                    v-for="(parent, index) in parents"
                    :key="index"
                    class="overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:border-primary/20"
                  >
                    <CardHeader
                      class="flex flex-row items-center justify-between border-b px-5 py-3 bg-muted/20"
                    >
                      <CardTitle class="text-xs font-semibold">
                        Orang Tua / Wali {{ index + 1 }}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-colors"
                        @click="removeParent(index)"
                      >
                        <Trash2 class="size-4" />
                      </Button>
                    </CardHeader>
                    <div class="p-5 grid gap-4 md:grid-cols-2 items-start">
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Hubungan</label>
                        <Select v-model="parent.relation">
                          <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih hubungan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="r in relationOptions"
                              :key="r.value"
                              :value="r.value"
                            >
                              {{ r.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Nama Lengkap</label>
                        <Input
                          v-model="parent.name"
                          placeholder="Nama lengkap"
                          maxlength="100"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">NIK</label>
                        <Input
                          v-model="parent.nik"
                          placeholder="16 digit NIK"
                          maxlength="16"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Tempat Lahir</label>
                        <Input
                          v-model="parent.birthPlace"
                          placeholder="Kota lahir"
                          maxlength="100"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Tanggal Lahir</label>
                        <Input
                          v-model="parent.birthDate"
                          type="date"
                        />
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Pekerjaan</label>
                        <Select v-model="parent.occupationId">
                          <SelectTrigger class="w-full">
                            <SelectValue placeholder="Pilih pekerjaan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="occ in occupations"
                              :key="occ.id"
                              :value="occ.id"
                            >
                              {{ occ.name }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">Penghasilan</label>
                        <Select v-model="parent.income">
                          <SelectTrigger class="w-full">
                            <SelectValue
                              placeholder="Pilih penghasilan (opsional)"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="opt in incomeOptions"
                              :key="opt.value"
                              :value="opt.value"
                            >
                              {{ opt.label }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-2">
                        <label class="text-sm font-medium">No. HP</label>
                        <Input
                          v-model="parent.phone"
                          placeholder="08xxx (opsional)"
                          maxlength="15"
                        />
                      </div>
                    </div>
                  </Card>
                </template>
              </div>
            </div>

            <div
              v-if="activeStep === 5"
              class="space-y-4 text-sm"
            >
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-2">Profil & Akademik</p>
                <div class="grid gap-1 md:grid-cols-2 text-muted-foreground">
                  <span>Nama: {{ values.name || '-' }}</span>
                  <span>NIK: {{ values.nik || '-' }}</span>
                  <span>NIS: {{ values.nis || '-' }}</span>
                  <span>NISN: {{ values.nisn || '-' }}</span>
                </div>
              </div>
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-1">Alamat</p>
                <p class="text-muted-foreground">
                  {{ hasAddress ? address.street : 'Dilewati' }}
                </p>
              </div>
              <div class="rounded-xl border p-4">
                <p class="font-semibold mb-1">Orang Tua / Wali</p>
                <p class="text-muted-foreground">
                  {{
                    parents.length > 0 ? `${parents.length} data` : 'Dilewati'
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
            {{ submitting ? 'Menyimpan...' : 'Simpan Siswa' }}
          </Button>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
