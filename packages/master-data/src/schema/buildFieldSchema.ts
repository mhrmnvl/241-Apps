import * as z from 'zod'
import type {
  MasterDataField,
  MasterDataNumberField,
  MasterDataTextField,
} from '../types/config'

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

function buildNumberSchema(field: MasterDataNumberField): z.ZodTypeAny {
  let base = z.coerce
    .number({ message: `${field.label} harus berupa angka.` })
    .int(`${field.label} harus bilangan bulat.`)

  if (field.min !== undefined) {
    base = base.min(field.min, `${field.label} minimal ${field.min}.`)
  }
  if (field.max !== undefined) {
    base = base.max(field.max, `${field.label} maksimal ${field.max}.`)
  }

  // Coerced, because an `<input type="number">` hands back a string. Without
  // this the value reaches the API as text and fails validation there instead,
  // where the message is far less useful.
  return field.required ? base : base.optional()
}

export function buildFieldSchema(fields: MasterDataField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    if (field.kind === 'text') {
      shape[field.key] = buildTextSchema(field)
    } else if (field.kind === 'number') {
      shape[field.key] = buildNumberSchema(field)
    } else {
      shape[field.key] = z.boolean().default(field.default ?? true)
    }
  }

  return z.object(shape)
}

export function buildInitialValues(
  fields: MasterDataField[],
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.kind === 'text') values[field.key] = ''
    else if (field.kind === 'number') values[field.key] = field.default ?? null
    else values[field.key] = field.default ?? true
  }

  return values
}

/** Drops fields marked `readOnlyOnEdit` from an update payload — they can only be set on create. */
export function omitReadOnlyOnEditFields(
  fields: MasterDataField[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.kind === 'text' && field.readOnlyOnEdit) continue
    payload[field.key] = values[field.key]
  }

  return payload
}
