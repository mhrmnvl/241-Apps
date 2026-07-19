import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { AddressSavePayload, UseAddressFormOptions } from '../types'

export function useAddressForm({
  props,
  emit,
  saveAddress,
}: UseAddressFormOptions) {
  const open = computed({
    get: () => props.open,
    set: (value: boolean) => {
      emit('update:open', value)
    },
  })

  const existingAddress = computed(() => props.profileData?.address)

  const formSchema = toTypedSchema(
    z.object({
      street: z
        .string()
        .min(1, 'Jalan / Dusun wajib diisi')
        .max(255, 'Maksimal 255 karakter'),
      rt: z.string().max(5, 'Maksimal 5 karakter').optional().or(z.literal('')),
      rw: z.string().max(5, 'Maksimal 5 karakter').optional().or(z.literal('')),
      village: z
        .string()
        .min(1, 'Desa / Kelurahan wajib diisi')
        .max(100, 'Maksimal 100 karakter'),
      district: z
        .string()
        .min(1, 'Kecamatan wajib diisi')
        .max(100, 'Maksimal 100 karakter'),
      city: z
        .string()
        .min(1, 'Kabupaten / Kota wajib diisi')
        .max(100, 'Maksimal 100 karakter'),
      province: z
        .string()
        .min(1, 'Provinsi wajib diisi')
        .max(100, 'Maksimal 100 karakter'),
      postalCode: z
        .string()
        .max(10, 'Maksimal 10 digit')
        .optional()
        .or(z.literal('')),
      country: z
        .string()
        .min(1, 'Negara wajib diisi')
        .max(100, 'Maksimal 100 karakter'),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      street: '',
      rt: '',
      rw: '',
      village: '',
      district: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Indonesia',
    },
  })

  watch(
    () => [props.open, existingAddress.value],
    () => {
      if (props.open) {
        const addr = existingAddress.value
        if (addr) {
          form.resetForm({
            values: {
              street: addr.street ?? '',
              rt: addr.rt ?? '',
              rw: addr.rw ?? '',
              village: addr.village ?? '',
              district: addr.district ?? '',
              city: addr.city ?? '',
              province: addr.province ?? '',
              postalCode: addr.postalCode ?? '',
              country: addr.country ?? 'Indonesia',
            },
          })
        } else {
          form.resetForm({
            values: {
              street: '',
              rt: '',
              rw: '',
              village: '',
              district: '',
              city: '',
              province: '',
              postalCode: '',
              country: 'Indonesia',
            },
          })
        }
      }
    },
    { immediate: true },
  )

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: AddressSavePayload = {
      street: values.street,
      rt: values.rt ?? null,
      rw: values.rw ?? null,
      village: values.village,
      district: values.district,
      city: values.city,
      province: values.province,
      postalCode: values.postalCode ?? null,
      country: values.country,
    }

    if (!existingAddress.value) {
      payload.isPrimary = true
    }

    const isCreate = !existingAddress.value
    const addressId = isCreate ? undefined : existingAddress.value?.id

    const { success } = await saveAddress(payload, isCreate, addressId)
    if (success) {
      open.value = false
      emit('reload')
    }
  })

  return {
    open,
    existingAddress,
    form,
    onSubmit,
  }
}
