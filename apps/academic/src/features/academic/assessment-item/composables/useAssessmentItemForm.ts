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
      // A mark is a percentage of this, so anything is arithmetically fine —
      // but the school marks out of a hundred, and a task set out of 1000
      // makes every rapor line read as a rounding error. Matched by the
      // same bound on the server.
      maxScore: z
        .number()
        .min(1, 'Skor maksimal minimal 1.')
        .max(100, 'Skor maksimal tidak boleh lebih dari 100.'),
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
      const fields = {
        name: values.name,
        type: values.type,
        weight: values.weight,
        maxScore: values.maxScore,
      }

      // The assignment is only sent when creating. On an update the server
      // rejects it outright — which task belongs to which teacher is not
      // something an edit gets to change.
      const teachingAssignmentId = options.teachingAssignmentId()
      if (!editItem && !teachingAssignmentId) {
        store.formError =
          'Belum ada jadwal mengajar untuk kelas dan mata pelajaran ini.'
        return
      }

      const result = await assessmentItemService.saveItem(
        editItem
          ? fields
          : { ...fields, teachingAssignmentId: teachingAssignmentId! },
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
