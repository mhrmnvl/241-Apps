import { describe, it, expect } from 'vitest'
import { buildResolveDecisions } from './buildResolveDecisions'
import type { ImportPreviewRow } from '../types'

interface Row {
  name: string
}

describe('buildResolveDecisions', () => {
  it('includes SUCCESS rows as update decisions', () => {
    const rows: ImportPreviewRow<Row>[] = [
      { row: 1, status: 'SUCCESS', data: { name: 'A' } },
    ]

    expect(buildResolveDecisions(rows, {})).toEqual([
      { existingId: undefined, action: 'update', data: { name: 'A' } },
    ])
  })

  it('follows the per-row action for CONFLICT rows with an existingId', () => {
    const rows: ImportPreviewRow<Row>[] = [
      {
        row: 1,
        status: 'CONFLICT',
        existingId: 'id-1',
        data: { name: 'A' },
      },
    ]

    expect(buildResolveDecisions(rows, { 1: 'skip' })).toEqual([
      { existingId: 'id-1', action: 'skip', data: { name: 'A' } },
    ])
  })

  it('defaults a CONFLICT row with no recorded action to skip', () => {
    const rows: ImportPreviewRow<Row>[] = [
      {
        row: 1,
        status: 'CONFLICT',
        existingId: 'id-1',
        data: { name: 'A' },
      },
    ]

    expect(buildResolveDecisions(rows, {})).toEqual([
      { existingId: 'id-1', action: 'skip', data: { name: 'A' } },
    ])
  })

  it('drops FAILED rows', () => {
    const rows: ImportPreviewRow<Row>[] = [
      { row: 1, status: 'FAILED', error: 'boom' },
    ]

    expect(buildResolveDecisions(rows, {})).toEqual([])
  })

  it('drops CONFLICT rows without an existingId (never resolvable)', () => {
    const rows: ImportPreviewRow<Row>[] = [
      { row: 1, status: 'CONFLICT', data: { name: 'A' } },
    ]

    expect(buildResolveDecisions(rows, { 1: 'update' })).toEqual([])
  })
})
