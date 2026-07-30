import { computed, watch, type Ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { Parent, ParentSavePayload, IncomeRange } from '../types'
import type { Occupation } from '@/features/academic/occupation'
import type { ComboboxOption } from '@/ui'

export function useParentForm(options: {
  open: Ref<boolean>
  editData: Ref<Parent | null | undefined>
  occupations: Ref<Occupation[]>
  onSave: (data: ParentSavePayload) => void
}) {
  const isEditing = computed(() => !!options.editData.value)

  const occupationOptions = computed<ComboboxOption[]>(() =>
    options.occupations.value.map((o) => ({
      value: o.id,
      label: o.name,
    })),
  )

  const incomeOptions = [
    { value: 'BELOW_500K', label: '< Rp 500.000' },
    { value: 'BETWEEN_500K_1M', label: 'Rp 500.000 - 1.000.000' },
    { value: 'BETWEEN_1M_2M', label: 'Rp 1.000.000 - 2.000.000' },
    { value: 'BETWEEN_2M_3M', label: 'Rp 2.000.000 - 3.000.000' },
    { value: 'ABOVE_3M', label: '> Rp 3.000.000' },
  ]

  const formSchema = toTypedSchema(
    z.object({
      name: z
        .string()
        .min(1, 'Nama wajib diisi.')
        .max(100, 'Nama maksimal 100 karakter.'),
      nik: z.string().length(16, 'NIK harus tepat 16 karakter.'),
      birthPlace: z
        .string()
        .min(1, 'Tempat lahir wajib diisi.')
        .max(100, 'Tempat lahir maksimal 100 karakter.'),
      birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
      email: z
        .string()
        .email('Format email tidak valid.')
        .optional()
        .or(z.literal('')),
      phone: z
        .string()
        .max(15, 'No. telepon maksimal 15 karakter.')
        .optional()
        .or(z.literal('')),
      occupationId: z.string().min(1, 'Pekerjaan wajib dipilih.'),
      income: z
        .enum([
          'BELOW_500K',
          'BETWEEN_500K_1M',
          'BETWEEN_1M_2M',
          'BETWEEN_2M_3M',
          'ABOVE_3M',
        ])
        .optional()
        .or(z.literal('')),
    }),
  )

  const { handleSubmit, resetForm, setValues } = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      nik: '',
      birthPlace: '',
      birthDate: '',
      email: '',
      phone: '',
      occupationId: '',
      income: '',
    },
  })

  watch(
    () => [options.open.value, options.editData.value] as const,
    ([isOpen]) => {
      if (isOpen) {
        const data = options.editData.value
        if (data) {
          setValues({
            name: data.name ?? '',
            nik: data.nik ?? '',
            birthPlace: data.birthPlace ?? '',
            birthDate: data.birthDate
              ? new Date(data.birthDate).toISOString().split('T')[0]
              : '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            occupationId: data.occupationId ?? '',
            income: data.income ?? '',
          })
        } else {
          resetForm()
        }
      }
    },
    { immediate: true },
  )

  const onSubmit = handleSubmit((values) => {
    const payload: ParentSavePayload = {
      name: values.name,
      nik: values.nik,
      birthPlace: values.birthPlace,
      birthDate: values.birthDate,
      email: values.email ?? undefined,
      phone: values.phone ?? undefined,
      occupationId: values.occupationId,
      income: (values.income as IncomeRange) || undefined,
    }
    options.onSave(payload)
  })

  return {
    isEditing,
    occupationOptions,
    incomeOptions,
    resetForm,
    onSubmit,
  }
}
