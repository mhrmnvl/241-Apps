import { computed, ref, watch, type Ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type {
  TeacherSavePayload,
  TeacherUpdatePayload,
  TeacherEditData,
  PositionListItem,
} from '../types'
import {
  buildTeacherCreatePayload,
  buildTeacherUpdatePayload,
  resolvePositionChange,
} from '../utils'
import { useEmploymentTypeOptions } from './useEmploymentTypeOptions'
import { usePositionCategoryFilter } from './usePositionCategoryFilter'

export function useTeacherFormDialog(options: {
  open: Ref<boolean>
  editData: Ref<TeacherEditData | null | undefined>
  positions: Ref<PositionListItem[]>
  onSave: (data: TeacherSavePayload | TeacherUpdatePayload) => void
  onSavePosition: (
    teacherId: string,
    positionId: string,
    oldPositionLinkId: string | null,
  ) => void
  onClose: () => void
}) {
  const isEditing = computed(() => !!options.editData.value)
  const _activeTab = ref('profil')
  const showConfirmAlert = ref(false)
  const originalPositionId = ref('')
  const originalPositionLinkId = ref<string | null>(null)

  const { employmentTypes } = useEmploymentTypeOptions()
  const { kategori, categoryOptions, filteredPositions } =
    usePositionCategoryFilter(options.positions)

  const profilFields = [
    'name',
    'nik',
    'gender',
    'birthPlace',
    'birthDate',
    'email',
    'phone',
  ] as const

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
        .max(255, 'Email tidak boleh lebih dari 255 karakter.')
        .email('Format alamat email tidak valid (contoh: nama@email.com).')
        .optional()
        .or(z.literal('')),
      phone: z
        .string()
        .max(15, 'Nomor HP tidak boleh lebih dari 15 digit.')
        .optional()
        .or(z.literal('')),
      nip: z
        .string()
        .max(20, 'NIP tidak boleh lebih dari 20 karakter.')
        .optional()
        .or(z.literal('')),
      nuptk: z
        .string()
        .max(20, 'NUPTK tidak boleh lebih dari 20 karakter.')
        .optional()
        .or(z.literal('')),
      employmentTypeId: z
        .string()
        .min(1, 'Silakan pilih status kepegawaian saat ini.'),
      positionId: z.string().optional().default(''),
    }),
  )

  const {
    handleSubmit,
    resetForm,
    setValues,
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
      nip: '',
      nuptk: '',
      employmentTypeId: '',
      positionId: '',
    },
  })

  const activeTab = computed({
    get: () => _activeTab.value,
    set: (val) => {
      if (val === 'kepegawaian') {
        void validateProfilFields().then((valid) => {
          if (valid) _activeTab.value = val
        })
        return
      }
      _activeTab.value = val
    },
  })

  watch(
    () => [options.open.value, options.editData.value],
    () => {
      if (options.open.value) {
        const data = options.editData.value
        _activeTab.value = data ? 'kepegawaian' : 'profil'
        showConfirmAlert.value = false
        kategori.value = ''
        if (data) {
          const primaryPos = data.teacherPositions?.find((ep) => ep.isPrimary)
          if (primaryPos) {
            originalPositionId.value = primaryPos.position?.id ?? ''
            originalPositionLinkId.value = primaryPos.id ?? null
            kategori.value = primaryPos.position?.category?.id ?? ''
          } else {
            originalPositionId.value = ''
            originalPositionLinkId.value = null
          }
          setValues({
            name: data.user?.profile?.name ?? '',
            nik: data.user?.profile?.nik ?? '',
            gender: data.user?.profile?.gender ?? 'MALE',
            birthPlace: data.user?.profile?.birthPlace ?? '',
            birthDate: data.user?.profile?.birthDate
              ? data.user.profile.birthDate.substring(0, 10)
              : '',
            email: data.user?.profile?.email ?? '',
            phone: data.user?.profile?.phone ?? '',
            nip: data.nip ?? '',
            nuptk: data.nuptk ?? '',
            employmentTypeId:
              data.employmentTypeId ?? data.employmentType?.id ?? '',
            positionId: primaryPos?.position?.id ?? '',
          })
        } else {
          resetForm()
        }
      }
    },
    { immediate: true },
  )

  async function validateProfilFields(): Promise<boolean> {
    const results = await Promise.all(
      profilFields.map((field) => validateField(field)),
    )
    return results.every((r) => r.valid)
  }

  function handleNext() {
    if (isEditing.value) {
      emitSave(formValues)
      return
    }

    if (activeTab.value === 'profil') {
      void validateProfilFields().then((valid) => {
        if (valid) _activeTab.value = 'kepegawaian'
      })
    } else if (activeTab.value === 'kepegawaian') {
      void handleSubmit((values) => {
        emitSave(values)
      })()
    }
  }

  function handleBack() {
    if (isEditing.value) {
      options.onClose()
      return
    }

    if (activeTab.value === 'kepegawaian') _activeTab.value = 'profil'
    else options.onClose()
  }

  function confirmSave() {
    showConfirmAlert.value = false
    void handleSubmit((values) => {
      emitSave(values)
    })()
  }

  function emitSave(values: Record<string, unknown>) {
    if (isEditing.value) {
      options.onSave(buildTeacherUpdatePayload(values))

      const currentTeacherId = options.editData.value?.id
      if (currentTeacherId) {
        const change = resolvePositionChange(
          currentTeacherId,
          (values.positionId as string) || '',
          originalPositionId.value,
          originalPositionLinkId.value,
        )
        if (change) {
          options.onSavePosition(
            change.teacherId,
            change.positionId,
            change.oldPositionLinkId,
          )
        }
      }
    } else {
      options.onSave(buildTeacherCreatePayload(values))
    }
  }

  return {
    isEditing,
    activeTab,
    showConfirmAlert,
    employmentTypes,
    kategori,
    categoryOptions,
    filteredPositions,
    resetForm,
    setFieldValue,
    handleNext,
    handleBack,
    confirmSave,
  }
}
