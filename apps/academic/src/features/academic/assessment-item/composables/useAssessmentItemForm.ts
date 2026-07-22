import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { assessmentItemService } from '../services/assessmentItemService'
import { useAssessmentItemStore } from '../stores/assessmentItemStore'
import type { AssessmentItem, AssessmentType } from '../types'

interface AssessmentItemFormValues {
  name: string
  type: AssessmentType
  weight: number
  maxScore: number
}

export function useAssessmentItemForm(options: {
  teachingAssignmentId: () => string | null
  editData?: () => AssessmentItem | null
  isOpen?: () => boolean
  onSuccess?: () => void | Promise<void>
}) {
  const store = useAssessmentItemStore()
  const { isSaving, formError } = storeToRefs(store)

  const formSchema = toTypedSchema(
    z.object({
      name: z
        .string()
        .min(1, 'Nama tugas wajib diisi.')
        .max(100, 'Nama tugas maksimal 100 karakter.'),
      type: z.enum(['DAILY', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'PRACTICAL']),
      weight: z.number().min(0, 'Bobot minimal 0.'),
      maxScore: z.number().min(0).max(1000, 'Skor maksimal 1000.'),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      type: 'DAILY',
      weight: 1,
      maxScore: 100,
    },
  })

  watch(
    [() => options.isOpen?.() ?? true, () => options.editData?.()],
    ([isOpen, data]) => {
      if (isOpen === false) return
      formError.value = null
      if (data) {
        form.setValues({
          name: data.name,
          type: data.type,
          weight: data.weight,
          maxScore: data.maxScore,
        })
      } else {
        form.resetForm({
          values: { name: '', type: 'DAILY', weight: 1, maxScore: 100 },
        })
      }
    },
    { immediate: true },
  )

  const isEditing = computed(() => !!options.editData?.())

  const onSubmit = form.handleSubmit(
    async (values: AssessmentItemFormValues) => {
      const editItem = options.editData?.()
      const result = await assessmentItemService.saveItem(
        {
          teachingAssignmentId: options.teachingAssignmentId() ?? undefined,
          name: values.name,
          type: values.type,
          weight: values.weight,
          maxScore: values.maxScore,
        },
        editItem?.id,
      )
      if (result.success) {
        if (options.onSuccess) {
          await options.onSuccess()
        }
        form.resetForm()
      }
    },
  )

  return { form, isSaving, formError, isEditing, onSubmit }
}
