import { describe, it, expect } from 'vitest'
import { getFieldErrorDetail } from './getFieldErrorDetail'

describe('getFieldErrorDetail', () => {
  it('returns an empty string when there is no error text', () => {
    expect(getFieldErrorDetail(['gender'], '')).toBe('')
  })

  it('returns the matching line for a single alias', () => {
    expect(
      getFieldErrorDetail(['NIS'], 'NIS wajib diisi; Nama wajib diisi'),
    ).toBe('NIS wajib diisi')
  })

  it('matches on any of several aliases', () => {
    expect(
      getFieldErrorDetail(
        ['gender', 'jenis kelamin'],
        'Jenis kelamin harus Laki-laki atau Perempuan',
      ),
    ).toBe('Jenis kelamin harus Laki-laki atau Perempuan')
  })

  it('returns an empty string when nothing matches', () => {
    expect(getFieldErrorDetail(['email'], 'NIS wajib diisi')).toBe('')
  })

  it('joins every matching line', () => {
    expect(
      getFieldErrorDetail(
        ['phone'],
        'Phone wajib diisi; Nama wajib diisi; Phone harus berupa angka',
      ),
    ).toBe('Phone wajib diisi; Phone harus berupa angka')
  })
})
