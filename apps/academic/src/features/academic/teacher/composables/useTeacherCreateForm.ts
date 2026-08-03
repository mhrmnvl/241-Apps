import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import {
  useAddressSubform,
  useDynamicEntryList,
  useMultiStepForm,
} from '@/features/academic/shared/multi-step-form'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import api from '@/shared/utils/api'
import { teacherApi } from '../api/teacherApi'
import { teacherService } from '../services/teacherService'
import { usePositionCategoryFilter } from './usePositionCategoryFilter'
import type {
  EmploymentTypeOption,
  PositionListItem,
  TeacherPositionInput,
} from '../types'

export function useTeacherCreateForm() {
  const router = useRouter()

  const steps = [
    { value: 1, title: 'Profil' },
    { value: 2, title: 'Kepegawaian' },
    { value: 3, title: 'Alamat' },
    { value: 4, title: 'Jabatan' },
    { value: 5, title: 'Ringkasan' },
  ]

  const employmentTypes = ref<EmploymentTypeOption[]>([])
  const positions = ref<PositionListItem[]>([])

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

  const { kategori, categoryOptions, filteredPositions } =
    usePositionCategoryFilter(positions)

  const { address, hasAddress, validateAddress } = useAddressSubform()

  const {
    items: extraPositions,
    addItem: addPosition,
    removeItem: removePosition,
  } = useDynamicEntryList<TeacherPositionInput>(() => ({
    positionId: '',
    hireDate: new Date().toISOString().substring(0, 10),
    isPrimary: false,
  }))

  type FieldName = Parameters<typeof validateField>[0]
  const PROFIL_FIELDS: FieldName[] = [
    'name',
    'nik',
    'gender',
    'birthPlace',
    'birthDate',
  ]
  const KEPEG_FIELDS: FieldName[] = ['employmentTypeId']

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
      { fields: KEPEG_FIELDS, unlocksStep: 3 },
    ],
    onCancel: () => void router.push('/teacher'),
  })

  function isValidPosition(p: TeacherPositionInput): boolean {
    return p.positionId !== '' && p.hireDate !== ''
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
    const invalidPosition = extraPositions.value.find(
      (p) => !isValidPosition(p),
    )
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
          email: values.email,
          phone: values.phone,
          nip: values.nip,
          nuptk: values.nuptk,
        },
        address: hasAddress.value ? { ...address.value } : null,
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
    kategori,
    categoryOptions,
    filteredPositions,
    address,
    hasAddress,
    extraPositions,
    addPosition,
    removePosition,
    employmentTypes,
    positions,
    submit,
  }
}
