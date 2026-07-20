import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { gradeService } from '../services/gradeService'
import { useGradeStore } from '../stores/gradeStore'
import type { Grade, GradeSavePayload } from '../types'

export function useGradeForm(options?: {
  editData?: () => Grade | null
  onSuccess?: () => void | Promise<void>
}) {
  const store = useGradeStore()
  const { isSaving, formError } = storeToRefs(store)

  const formSchema = toTypedSchema(
    z.object({
      level: z
        .number({ invalid_type_error: 'Tingkat wajib diisi' })
        .min(1, 'Tingkat harus antara 1 dan 15')
        .max(15, 'Tingkat harus antara 1 dan 15'),
      name: z.string().min(1, 'Nama tingkat wajib diisi'),
      isActive: z.boolean().default(true),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      level: 1,
      name: '',
      isActive: true,
    },
  })

  watch(
    () => options?.editData?.(),
    (data) => {
      if (data) {
        form.setValues({
          level: data.level,
          name: data.name,
          isActive: data.isActive,
        })
      } else {
        form.resetForm()
      }
    },
    { immediate: true },
  )

  const isEditing = computed(() => !!options?.editData?.())

  const onSubmit = form.handleSubmit(async (values) => {
    const editItem = options?.editData?.()
    const payload: GradeSavePayload = {
      level: values.level,
      name: values.name.trim(),
      isActive: values.isActive,
    }
    const result = await gradeService.saveGrade(editItem?.id ?? null, payload)
    if (result.success) {
      if (options?.onSuccess) {
        await options.onSuccess()
      }
      form.resetForm()
    }
  })

  return {
    form,
    isSaving,
    formError,
    isEditing,
    onSubmit,
  }
}
