import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { profileFormSchema } from './profileFormSchema'
import type {
  RawProfileData,
  ProfileUpdatePayload,
  MaritalStatus,
} from '../types'

export function useProfileForm(props: {
  open: boolean
  profileData?: RawProfileData | null
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'save', data: ProfileUpdatePayload): void
  }
}) {
  const open = computed({
    get: () => props.open,
    set: (value: boolean) => {
      props.emit('update:open', value)
    },
  })

  const _activeTab = ref('utama')
  const activeTab = computed({
    get: () => _activeTab.value,
    set: (val) => {
      _activeTab.value = val
    },
  })

  const form = useForm({
    validationSchema: profileFormSchema,
    keepValuesOnUnmount: true,
    initialValues: {
      name: '',
      nik: '',
      gender: undefined as 'MALE' | 'FEMALE' | undefined,
      birthPlace: '',
      birthDate: '',
      email: '',
      phone: '',
      bloodTypeId: undefined as string | undefined,
      religionId: undefined as string | undefined,
      maritalStatus: undefined as MaritalStatus | undefined,
      kk: '',
      npwp: '',
    },
  })

  watch(
    () => [props.open, props.profileData],
    () => {
      if (props.open) {
        _activeTab.value = 'utama'
        const data = props.profileData
        if (data) {
          form.resetForm({
            values: {
              name: data.name ?? '',
              nik: data.nik ?? '',
              gender: data.gender ?? undefined,
              birthPlace: data.birthPlace ?? '',
              birthDate: data.birthDate
                ? String(data.birthDate).substring(0, 10)
                : '',
              email: data.email ?? '',
              phone: data.phone ?? '',
              bloodTypeId: data.bloodTypeId ?? data.bloodType?.id ?? undefined,
              religionId: data.religionId ?? data.religion?.id ?? undefined,
              maritalStatus: data.maritalStatus ?? undefined,
              kk: data.noKk ?? '',
              npwp: data.npwp ?? '',
            },
          })
        } else {
          form.resetForm()
        }
      }
    },
    { immediate: true },
  )

  const onSubmit = form.handleSubmit(
    (values) => {
      const payload: ProfileUpdatePayload = {
        name: values.name,
        nik: values.nik,
        gender: values.gender,
        birthPlace: values.birthPlace,
        birthDate: values.birthDate,
        email: values.email === '' ? null : values.email,
        phone: values.phone === '' ? null : values.phone,
        bloodTypeId:
          !values.bloodTypeId || values.bloodTypeId === 'none'
            ? null
            : values.bloodTypeId,
        religionId:
          !values.religionId || values.religionId === 'none'
            ? null
            : values.religionId,
        maritalStatus:
          !values.maritalStatus || values.maritalStatus === 'none'
            ? null
            : values.maritalStatus,
        noKk: values.kk === '' ? null : values.kk,
        npwp: values.npwp === '' ? null : values.npwp,
      }

      props.emit('save', payload)
    },
    (ctx) => {
      const errorKeys = Object.keys(ctx.errors)
      if (errorKeys.length > 0) {
        toast.error('Gagal Menyimpan', {
          description:
            'Ada input yang belum valid atau masih kosong di tab sebelumnya.',
        })
      }
    },
  )

  async function handleNext() {
    const result = await form.validate()
    if (result.valid) {
      _activeTab.value = 'lanjutan'
    }
  }

  function handleBack() {
    if (activeTab.value === 'lanjutan') {
      _activeTab.value = 'utama'
    } else {
      open.value = false
    }
  }

  return {
    open,
    activeTab,
    form,
    onSubmit,
    handleNext,
    handleBack,
  }
}
