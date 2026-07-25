import { describe, it, expect } from 'vitest'
import { isValidExcelFile } from './isValidExcelFile'

function fakeFile(name: string, type: string): File {
  return new File(['x'], name, { type })
}

describe('isValidExcelFile', () => {
  it('accepts the Excel MIME type', () => {
    const file = fakeFile(
      'data.bin',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    expect(isValidExcelFile(file)).toBe(true)
  })

  it('accepts a .xlsx extension even with an unrecognized MIME type', () => {
    const file = fakeFile('data.xlsx', 'application/octet-stream')
    expect(isValidExcelFile(file)).toBe(true)
  })

  it('rejects a non-Excel file', () => {
    const file = fakeFile('data.csv', 'text/csv')
    expect(isValidExcelFile(file)).toBe(false)
  })
})
