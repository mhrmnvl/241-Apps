import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { classroomApi, type Classroom } from '@/features/academic/classroom'
import { occupationApi } from '@/features/academic/occupation'
import type { IncomeRange } from '@/features/academic/parent'
import {
  useAddressSubform,
  useDynamicEntryList,
  useMultiStepForm,
} from '@/features/academic/shared/multi-step-form'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import { studentService } from '../services/studentService'
import type { GradeOption, StudentParentInput } from '../types'

export function useStudentCreateForm() {
  const router = useRouter()

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
        email: values.email,
        phone: values.phone,
        nis: values.nis,
        nisn: values.nisn,
        gradeId: values.gradeId,
        classroomId: values.classroomId,
        identifier: values.nis,
        password: values.nis,
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
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data pilihan.'),
      )
    }
  })

  // Callers address fields by a runtime string, while vee-validate types the path
  // as a union of the known schema keys, which a plain string cannot satisfy.
  const setFieldValueWrapper = (field: string, value: unknown) => {
    setFieldValue(
      field as Parameters<typeof setFieldValue>[0],
      value as Parameters<typeof setFieldValue>[1],
    )
  }

  return {
    steps,
    activeStep,
    submitting,
    mobileVisibleStepValues,
    goToStep,
    next,
    back,
    values,
    setFieldValue: setFieldValueWrapper,
    address,
    hasAddress,
    parents,
    addParent,
    removeParent,
    grades,
    classrooms,
    filteredClassrooms,
    occupations,
    incomeOptions,
    relationOptions,
    submit,
  }
}
