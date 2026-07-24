import * as z from 'zod'
import type { MasterDataField, MasterDataTextField } from '../types/config'

function buildTextSchema(field: MasterDataTextField): z.ZodTypeAny {
  const base = field.maxLength
    ? z
        .string()
        .max(
          field.maxLength,
          `${field.label} maksimal ${field.maxLength} karakter.`,
        )
    : z.string()

  return field.required
    ? base.min(1, `${field.label} wajib diisi.`)
    : base.optional().default('')
}

export function buildFieldSchema(fields: MasterDataField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    shape[field.key] =
      field.kind === 'text'
        ? buildTextSchema(field)
        : z.boolean().default(field.default ?? true)
  }

  return z.object(shape)
}

export function buildInitialValues(
  fields: MasterDataField[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const field of fields) {
    values[field.key] = field.kind === 'text' ? '' : (field.default ?? true)
  }

  return values
}
