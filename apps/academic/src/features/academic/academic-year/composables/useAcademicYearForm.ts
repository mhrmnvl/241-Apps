import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { academicYearService } from '../services/academicYearService'
import { useAcademicYearStore } from '../stores/academicYearStore'
import type { AcademicYear, AcademicYearSavePayload } from '../types'

export function useAcademicYearForm(options?: {
  editData?: () => AcademicYear | null
  isOpen?: () => boolean
  onSuccess?: () => void | Promise<void>
}) {
  const store = useAcademicYearStore()
  const { isSaving, formError } = storeToRefs(store)
  const showConfirmAlert = ref(false)

  const formSchema = toTypedSchema(
    z.object({
      name: z
        .string()
        .min(1, 'Nama tahun ajaran wajib diisi.')
        .min(3, 'Nama tahun ajaran minimal 3 karakter.'),
      isActive: z.boolean().default(true),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      isActive: true,
    },
  })

  // Re-init whenever the dialog opens (not only when editData changes), so
  // stale validation errors from a previous attempt don't persist on reopen.
  watch(
    () => [options?.isOpen?.() ?? true, options?.editData?.()] as const,
    ([isOpen, data]) => {
      if (isOpen === false) return
      formError.value = null
      if (data) {
        form.setValues({
          name: data.name ?? '',
          isActive: data.isActive ?? true,
        })
      } else {
        form.resetForm()
      }
    },
    { immediate: true },
  )

  const isEditing = computed(() => !!options?.editData?.())

  function buildPayload(values: {
    name: string
    isActive: boolean
  }): AcademicYearSavePayload {
    return {
      name: values.name,
      isActive: values.isActive,
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    if (isEditing.value) {
      showConfirmAlert.value = true
    } else {
      void executeSubmit(values)
    }
  })

  async function executeSubmit(values: { name: string; isActive: boolean }) {
    const editItem = options?.editData?.()
    const payload = buildPayload(values)
    const result = await academicYearService.saveAcademicYear(
      editItem?.id ?? null,
      payload,
      editItem?.isActive,
    )
    if (result.success) {
      if (options?.onSuccess) {
        await options.onSuccess()
      }
      form.resetForm()
    }
  }

  function confirmSave() {
    showConfirmAlert.value = false
    void form.handleSubmit(executeSubmit)()
  }

  return {
    form,
    isSaving,
    formError,
    showConfirmAlert,
    isEditing,
    onSubmit,
    confirmSave,
  }
}
