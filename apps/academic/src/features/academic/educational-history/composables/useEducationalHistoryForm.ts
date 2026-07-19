import { ref, computed, watch, onMounted } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useEducationalHistory } from './useEducationalHistory'
import type {
  EducationalHistoryEditData,
  EducationalHistoryCreatePayload,
  EducationalHistoryUpdatePayload,
} from '../types'

const educationalHistoryFormSchema = toTypedSchema(
  z.object({
    level: z.string().min(1, 'Jenjang pendidikan wajib dipilih'),
    institution: z.string().min(1, 'Nama institusi wajib diisi').max(200),
    major: z.string().max(100).optional().or(z.literal('')),
    startYear: z.coerce.number().min(1900, 'Tahun tidak valid').max(2100),
    endYear: z.coerce
      .number()
      .min(1900)
      .max(2100)
      .optional()
      .or(z.literal(''))
      .or(z.literal(0)),
    status: z.string().max(50).optional().or(z.literal('')),
  }),
)

export function useEducationalHistoryForm(props: {
  open: boolean
  editingItem?: EducationalHistoryEditData | null
  userId: string
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'reload'): void
  }
}) {
  const { isSaving, saveEducationalHistory, getEducationLevels } =
    useEducationalHistory()

  const educationLevels = ref<{ id: string; name: string }[]>([])

  onMounted(async () => {
    educationLevels.value = await getEducationLevels()
  })

  const form = useForm({
    validationSchema: educationalHistoryFormSchema,
    initialValues: {
      level: '',
      institution: '',
      major: '',
      startYear: new Date().getFullYear(),
      endYear: '',
      status: '',
    },
  })

  const isCreate = computed(() => !props.editingItem?.id)

  watch(
    () => [props.open, props.editingItem],
    ([isOpen]) => {
      if (isOpen) {
        if (props.editingItem?.id) {
          form.resetForm({
            values: {
              level: props.editingItem.level ?? '',
              institution: props.editingItem.institution ?? '',
              major: props.editingItem.major ?? '',
              startYear:
                props.editingItem.startYear ?? new Date().getFullYear(),
              endYear: Number(props.editingItem.endYear) || '',
              status: props.editingItem.status ?? '',
            },
          })
        } else {
          form.resetForm({
            values: {
              level: '',
              institution: '',
              major: '',
              startYear: new Date().getFullYear(),
              endYear: '',
              status: '',
            },
          })
        }
      }
    },
    { immediate: true },
  )

  const onSubmit = form.handleSubmit(async (values) => {
    const basePayload = {
      level: values.level,
      institution: values.institution,
      major: values.major ?? null,
      startYear: Number(values.startYear),
      endYear: values.endYear ? Number(values.endYear) : null,
      status: (values.status ??
        undefined) as EducationalHistoryCreatePayload['status'],
    }

    if (isCreate.value) {
      const payload: EducationalHistoryCreatePayload = {
        ...basePayload,
        profileId: props.userId,
      }
      const { success } = await saveEducationalHistory(payload, true)
      if (success) {
        props.emit('update:open', false)
        props.emit('reload')
      }
    } else {
      const payload: EducationalHistoryUpdatePayload = basePayload
      const { success } = await saveEducationalHistory(
        payload,
        false,
        props.editingItem?.id,
      )
      if (success) {
        props.emit('update:open', false)
        props.emit('reload')
      }
    }
  })

  return {
    isCreate,
    isSaving,
    educationLevels,
    form,
    onSubmit,
  }
}
