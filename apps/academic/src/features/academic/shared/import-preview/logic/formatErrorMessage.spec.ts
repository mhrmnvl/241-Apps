import { describe, it, expect } from 'vitest'
import { formatErrorMessage } from './formatErrorMessage'
import type { ImportColumnDescriptor } from '../types'

const descriptors: ImportColumnDescriptor[] = [
  { key: 'nis', header: 'NIS', align: 'center', messageLabel: 'NIS' },
  {
    key: 'gender',
    header: 'Jenis Kelamin',
    align: 'left',
    messageLabel: 'jenis kelamin',
  },
]

describe('formatErrorMessage', () => {
  it('returns an empty string for no error', () => {
    expect(formatErrorMessage(undefined, descriptors)).toBe('')
  })

  it('strips the technical validation prefix', () => {
    expect(
      formatErrorMessage(
        'Validation failed: nis should not be empty',
        descriptors,
      ),
    ).toBe('NIS tidak boleh kosong')
  })

  it('substitutes a descriptor field key for its messageLabel', () => {
    expect(
      formatErrorMessage(
        'nis must be longer than or equal to 5 characters',
        descriptors,
      ),
    ).toBe('NIS harus minimal 5 karakter')
  })

  it('leaves a field key untranslated when no messageLabel is set', () => {
    const noLabel: ImportColumnDescriptor[] = [
      { key: 'grade', header: 'Tingkat', align: 'center' },
    ]
    expect(formatErrorMessage('grade should not be empty', noLabel)).toBe(
      'Grade tidak boleh kosong',
    )
  })

  it('translates generic validation phrases without knowing field names', () => {
    expect(
      formatErrorMessage(
        'gender must be one of the following values: MALE, FEMALE',
        descriptors,
      ),
    ).toBe('Jenis kelamin harus Laki-laki atau Perempuan')
  })

  it('de-duplicates repeated lines after translation', () => {
    expect(
      formatErrorMessage('nis is required; nis is required', descriptors),
    ).toBe('NIS wajib diisi')
  })
})
