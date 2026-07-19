import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useAchievement } from './useAchievement'
import type {
  AchievementSavePayload,
  UseAchievementFormOptions,
} from '../types'

export function useAchievementForm({ props, emit }: UseAchievementFormOptions) {
  const { isSaving, saveAchievement } = useAchievement()

  const open = computed({
    get: () => props.open,
    set: (v: boolean) => emit('update:open', v),
  })

  const isCreate = computed(() => !props.editingItem?.id)

  const formSchema = toTypedSchema(
    z.object({
      name: z.string().min(1, 'Nama prestasi wajib diisi').max(200),
      level: z.string().min(1, 'Pencapaian wajib diisi').max(100),
      typeId: z.string().min(1, 'Tingkat wajib dipilih').max(100),
      year: z.coerce.number().min(1900, 'Tahun tidak valid').max(2100),
      description: z.string().optional().or(z.literal('')),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      name: '',
      level: '',
      typeId: '',
      year: new Date().getFullYear(),
      description: '',
    },
  })

  watch(
    () => [props.open, props.editingItem],
    ([isOpen]) => {
      if (isOpen) {
        if (props.editingItem?.id) {
          form.resetForm({
            values: {
              name: props.editingItem.name ?? '',
              level: props.editingItem.level ?? '',
              typeId: props.editingItem.typeId ?? '',
              year: props.editingItem.year ?? new Date().getFullYear(),
              description: props.editingItem.description ?? '',
            },
          })
        } else {
          form.resetForm({
            values: {
              name: '',
              level: '',
              typeId: '',
              year: new Date().getFullYear(),
              description: '',
            },
          })
        }
      }
    },
    { immediate: true },
  )

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: AchievementSavePayload = {
      profileId: props.profileId,
      name: values.name,
      level: values.level,
      typeId: values.typeId,
      year: values.year,
      description: values.description ?? undefined,
    }

    const { success } = await saveAchievement(
      payload,
      isCreate.value,
      props.editingItem?.id,
    )
    if (success) {
      open.value = false
      emit('reload')
    }
  })

  return {
    open,
    isCreate,
    isSaving,
    form,
    onSubmit,
  }
}
