import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { useRouter } from 'vue-router'
import { useAuthLogin } from './useAuthLogin'

export function useLoginForm() {
  const router = useRouter()
  const { loginUser } = useAuthLogin()

  const isSubmitting = ref(false)
  const errorMessage = ref<string | null>(null)

  const formSchema = toTypedSchema(
    z.object({
      identifier: z.string().min(1, 'ID Pengguna wajib diisi.'),
      password: z.string().min(1, 'Password wajib diisi.'),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    isSubmitting.value = true
    errorMessage.value = null

    try {
      await loginUser({
        identifier: values.identifier.trim(),
        password: values.password,
      })
      await router.push({ name: 'dashboard' })
    } catch (error) {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : 'Login gagal. Silakan coba lagi.'
    } finally {
      isSubmitting.value = false
    }
  })

  return {
    form,
    isSubmitting,
    errorMessage,
    onSubmit,
  }
}
