<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { Classroom } from '@/features/academic/classroom'
import type { StudentSavePayload, GradeOption } from '../types'
import { DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { formatEntityName } from '@/shared/utils/utils'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  classrooms: Classroom[]
  grades: GradeOption[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: StudentSavePayload]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) resetForm()
    emit('update:open', value)
  },
})

const _activeTab = ref('profil')
const activeTab = computed({
  get: () => _activeTab.value,
  set: (val) => {
    if (val === 'akademik') {
      void validateProfilFields().then((valid) => {
        if (valid) _activeTab.value = val
      })
      return
    }
    _activeTab.value = val
  },
})

const profilFields = [
  'name',
  'nik',
  'gender',
  'birthPlace',
  'birthDate',
] as const

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
      .max(255, 'Email tidak boleh lebih dari 255 karakter.')
      .email('Format alamat email tidak valid (contoh: nama@email.com).')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(15, 'Nomor HP tidak boleh lebih dari 15 digit.')
      .optional()
      .or(z.literal('')),
    nis: z
      .string()
      .min(1, 'Nomor Induk Siswa (NIS) wajib diisi.')
      .max(20, 'NIS tidak boleh lebih dari 20 karakter.'),
    nisn: z
      .string()
      .min(1, 'Nomor Induk Siswa Nasional (NISN) wajib diisi.')
      .max(20, 'NISN tidak boleh lebih dari 20 karakter.'),
    gradeId: z.string().optional().default(''),
    classroomId: z.string().optional().default(''),
  }),
)

const {
  handleSubmit,
  resetForm,
  setFieldValue,
  values: formValues,
  validateField,
} = useForm({
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

watch(
  () => [props.open],
  () => {
    if (props.open) {
      _activeTab.value = 'profil'
      resetForm()
    }
  },
  { immediate: true },
)

const filteredClassrooms = computed(() => {
  if (!props.classrooms) return []
  if (!formValues.gradeId) return props.classrooms
  return props.classrooms.filter(
    (c) =>
      c.gradeId === formValues.gradeId ||
      c.classroomLevelId === formValues.gradeId,
  )
})

async function validateProfilFields(): Promise<boolean> {
  const results = await Promise.all(
    profilFields.map((field) => validateField(field)),
  )
  return results.every((r) => r.valid)
}

function handleNext() {
  if (activeTab.value === 'profil') {
    void validateProfilFields().then((valid) => {
      if (valid) _activeTab.value = 'akademik'
    })
  } else if (activeTab.value === 'akademik') {
    void handleSubmit((values) => {
      const payload: StudentSavePayload = {
        name: values.name,
        nik: values.nik,
        gender: values.gender,
        birthPlace: values.birthPlace,
        birthDate: values.birthDate,
        email: values.email === '' ? undefined : values.email,
        phone: values.phone === '' ? undefined : values.phone,
        nis: values.nis,
        nisn: values.nisn,
        gradeId: values.gradeId === '' ? undefined : values.gradeId,
        classroomId: values.classroomId === '' ? undefined : values.classroomId,
        identifier: values.nis,
        password: values.nis,
      }
      emit('save', payload)
    })()
  }
}

function handleBack() {
  if (activeTab.value === 'akademik') _activeTab.value = 'profil'
  else open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      class="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col gap-0 border-l p-0"
    >
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle class="text-xl"> Tambah Siswa Baru </SheetTitle>
      </SheetHeader>

      <Tabs
        v-model="activeTab"
        class="flex-1 w-full flex flex-col min-h-0"
      >
        <div
          class="border-b shrink-0 z-10 bg-background shadow-sm px-6 pt-4 pb-2"
        >
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger
              value="profil"
              :class="activeTab === 'profil' ? 'bg-background shadow-sm' : ''"
            >
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="akademik"
              :class="activeTab === 'akademik' ? 'bg-background shadow-sm' : ''"
            >
              Akademik
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea class="flex-1 min-h-0">
          <div class="px-6 py-4">
            <div v-if="activeTab === 'profil'">
              <div class="grid gap-5 md:grid-cols-2 p-1">
                <FormField
                  v-slot="{ componentField }"
                  name="name"
                >
                  <FormItem class="md:col-span-2 content-start">
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
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contoh@email.com (ops/)"
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
                    <FormLabel>No. HP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789 (ops/)"
                        maxlength="15"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>

            <div v-if="activeTab === 'akademik'">
              <div class="grid gap-5 md:grid-cols-2 p-1">
                <FormField
                  v-slot="{ componentField }"
                  name="nis"
                >
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
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
                  <FormItem class="content-start">
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
                          v-for="lvl in props.grades"
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
                  <FormItem class="content-start">
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
                          {{ formatEntityName(cls.displayName) }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>

          <p
            v-if="formError"
            class="text-sm font-medium text-destructive mt-6 mx-1 mb-1 bg-red-50 p-3 rounded border border-red-100"
          >
            {{ formError }}
          </p>
        </ScrollArea>
      </Tabs>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background relative mt-auto"
      >
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="handleBack"
        >
          {{ activeTab === 'profil' ? 'Batal' : 'Kembali' }}
        </Button>

        <template v-if="activeTab !== 'akademik'">
          <Button
            variant="default"
            @click="handleNext"
          >
            Lanjut
          </Button>
        </template>
        <template v-else>
          <Button
            variant="default"
            :disabled="isSaving"
            @click="handleNext"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </template>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
