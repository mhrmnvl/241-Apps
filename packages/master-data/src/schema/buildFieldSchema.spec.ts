import { describe, expect, it } from 'vitest'
import {
  buildFieldSchema,
  buildInitialValues,
  omitReadOnlyOnEditFields,
} from './buildFieldSchema'
import type { MasterDataField } from '../types/config'

const fields: MasterDataField[] = [
  { key: 'code', kind: 'text', label: 'Kode', required: true, maxLength: 5 },
  { key: 'name', kind: 'text', label: 'Nama', required: true, maxLength: 10 },
  { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
]

describe('buildFieldSchema', () => {
  it('rejects a missing required text field', () => {
    const schema = buildFieldSchema(fields)
    const result = schema.safeParse({ code: '', name: 'ok', isActive: true })
    expect(result.success).toBe(false)
  })

  it('rejects a text field over its maxLength', () => {
    const schema = buildFieldSchema(fields)
    const result = schema.safeParse({
      code: 'toolong',
      name: 'ok',
      isActive: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid input and keeps the boolean field intact', () => {
    const schema = buildFieldSchema(fields)
    const result = schema.safeParse({
      code: 'ABC',
      name: 'ok',
      isActive: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(false)
    }
  })

  it('defaults an optional text field to an empty string', () => {
    const schema = buildFieldSchema([
      { key: 'note', kind: 'text', label: 'Catatan' },
    ])
    const result = schema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.note).toBe('')
    }
  })
})

describe('buildInitialValues', () => {
  it('seeds text fields empty and boolean fields from their default', () => {
    expect(buildInitialValues(fields)).toEqual({
      code: '',
      name: '',
      isActive: true,
    })
  })
})

describe('omitReadOnlyOnEditFields', () => {
  const fieldsWithReadOnlyCode: MasterDataField[] = [
    {
      key: 'code',
      kind: 'text',
      label: 'Kode',
      required: true,
      readOnlyOnEdit: true,
    },
    { key: 'name', kind: 'text', label: 'Nama', required: true },
    { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
  ]

  it('drops fields marked readOnlyOnEdit from the payload', () => {
    const payload = omitReadOnlyOnEditFields(fieldsWithReadOnlyCode, {
      code: 'SMA',
      name: 'Sekolah Menengah Atas',
      isActive: true,
    })

    expect(payload).toEqual({ name: 'Sekolah Menengah Atas', isActive: true })
  })

  it('keeps every field when none are marked readOnlyOnEdit', () => {
    const payload = omitReadOnlyOnEditFields(fields, {
      code: 'ABC',
      name: 'ok',
      isActive: true,
    })

    expect(payload).toEqual({ code: 'ABC', name: 'ok', isActive: true })
  })
})

/**
 * The number kind exists for ordering columns — semester terms, and whatever
 * else turns out to have an inherent sequence. The coercion is the load-bearing
 * part: an `<input type="number">` hands back a string, and without it the
 * value reaches the API as text and fails validation there, where the message
 * is far less useful.
 */
describe('buildFieldSchema — number fields', () => {
  const numberFields: MasterDataField[] = [
    {
      key: 'sequence',
      kind: 'number',
      label: 'Urutan',
      min: 1,
      required: true,
    },
  ]

  it('coerces the string an input element produces', () => {
    const result = buildFieldSchema(numberFields).safeParse({ sequence: '2' })

    expect(result.success).toBe(true)
    expect(result.success && result.data.sequence).toBe(2)
  })

  it('rejects a value below the stated minimum', () => {
    const result = buildFieldSchema(numberFields).safeParse({ sequence: 0 })

    expect(result.success).toBe(false)
  })

  it('rejects a fraction, since these are ordinal', () => {
    const result = buildFieldSchema(numberFields).safeParse({ sequence: 1.5 })

    expect(result.success).toBe(false)
  })

  it('rejects text that is not a number', () => {
    const result = buildFieldSchema(numberFields).safeParse({
      sequence: 'pertama',
    })

    expect(result.success).toBe(false)
  })

  it('allows an optional number to be omitted', () => {
    const optional: MasterDataField[] = [
      { key: 'sequence', kind: 'number', label: 'Urutan' },
    ]

    expect(buildFieldSchema(optional).safeParse({}).success).toBe(true)
  })

  /** Null, not '' — an empty numeric input is absent, not the string nothing. */
  it('starts a number field empty rather than at zero', () => {
    expect(buildInitialValues(numberFields)).toEqual({ sequence: null })
  })

  it('honours a stated default', () => {
    const withDefault: MasterDataField[] = [
      { key: 'sequence', kind: 'number', label: 'Urutan', default: 1 },
    ]

    expect(buildInitialValues(withDefault)).toEqual({ sequence: 1 })
  })
})
