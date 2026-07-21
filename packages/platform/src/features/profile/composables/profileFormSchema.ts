import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const profileFormSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'Nama lengkap wajib diisi')
      .max(100, 'Nama tidak boleh lebih dari 100 karakter.'),
    nik: z.string().length(16, 'NIK harus tepat 16 digit'),
    gender: z.enum(['MALE', 'FEMALE'], {
      required_error: 'Jenis kelamin wajib dipilih',
    }),
    birthPlace: z
      .string()
      .min(1, 'Tempat lahir wajib diisi')
      .max(100, 'Tempat lahir tidak boleh lebih dari 100 karakter.'),
    birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
    email: z
      .string()
      .max(255, 'Email tidak boleh lebih dari 255 karakter.')
      .email('Format email tidak valid')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .max(15, 'Nomor HP tidak boleh lebih dari 15 digit.')
      .optional()
      .or(z.literal('')),
    bloodTypeId: z.string().optional().or(z.literal('')),
    religionId: z.string().optional().or(z.literal('')),
    maritalStatus: z
      .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'none'])
      .optional()
      .or(z.literal('')),
    kk: z.string().max(16, 'Maksimal 16 digit').optional().or(z.literal('')),
    npwp: z
      .string()
      .max(20, 'Maksimal 20 karakter')
      .optional()
      .or(z.literal('')),
  }),
)
