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
