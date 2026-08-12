import { beforeEach, describe, expect, it, vi } from 'vitest'
import { workPatternApi } from '../api/workPatternApi'
import {
  blockingRecords,
  importPreview,
  workPatternService,
} from '../services/workPatternService'

vi.mock('../api/workPatternApi', () => ({
  workPatternApi: {
    getPatterns: vi.fn(),
    createPattern: vi.fn(),
    updatePattern: vi.fn(),
    deletePattern: vi.fn(),
    replaceDays: vi.fn(),
    getAssignments: vi.fn(),
    assign: vi.fn(),
    getNonWorkingDays: vi.fn(),
    bulkNonWorkingDays: vi.fn(),
    deleteNonWorkingDay: vi.fn(),
    getPeriods: vi.fn(),
    closePeriod: vi.fn(),
  },
}))

vi.mock('@/features/lookup', () => ({
  lookupService: { listCalendarEntries: vi.fn() },
}))

vi.mock('vue-sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const { lookupService } = await import('@/features/lookup')

describe('calendar import preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    importPreview.value = []
    vi.mocked(workPatternApi.getNonWorkingDays).mockResolvedValue({
      data: { data: [] },
    } as never)
  })

  // A single calendar entry can span days — a week of semester holidays is one
  // row with a start and an end.
  it('expands a multi-day entry into one row per date', async () => {
    vi.mocked(lookupService.listCalendarEntries).mockResolvedValue([
      {
        id: 'cal-1',
        title: 'Libur Semester',
        startDate: '2026-12-21',
        endDate: '2026-12-24',
      },
    ])

    await workPatternService.previewFromCalendar('year-1', 'type-1')

    expect(importPreview.value.map((entry) => entry.date)).toEqual([
      '2026-12-21',
      '2026-12-22',
      '2026-12-23',
      '2026-12-24',
    ])
  })

  it('keeps a single-day entry as one date', async () => {
    vi.mocked(lookupService.listCalendarEntries).mockResolvedValue([
      {
        id: 'cal-2',
        title: 'HUT RI',
        startDate: '2026-08-17',
        endDate: '2026-08-17',
      },
    ])

    await workPatternService.previewFromCalendar('year-1', 'type-1')

    expect(importPreview.value).toEqual([
      { date: '2026-08-17', name: 'HUT RI', sourceCalendarId: 'cal-2' },
    ])
  })

  // The whole point of the preview: nothing is written until confirmed.
  it('writes nothing while previewing', async () => {
    vi.mocked(lookupService.listCalendarEntries).mockResolvedValue([])

    await workPatternService.previewFromCalendar('year-1', 'type-1')

    expect(workPatternApi.bulkNonWorkingDays).not.toHaveBeenCalled()
  })

  it('clears the preview when the calendar cannot be read', async () => {
    importPreview.value = [{ date: '2026-08-17', name: 'stale' }]
    vi.mocked(lookupService.listCalendarEntries).mockRejectedValue(
      new Error('boom'),
    )

    await workPatternService.previewFromCalendar('year-1', 'type-1')

    expect(importPreview.value).toEqual([])
  })

  it('posts exactly the previewed dates on confirm', async () => {
    importPreview.value = [{ date: '2026-08-17', name: 'HUT RI' }]
    vi.mocked(workPatternApi.bulkNonWorkingDays).mockResolvedValue({
      data: { data: { imported: 1, skipped: 0 } },
    } as never)

    await workPatternService.confirmImport(2026)

    expect(workPatternApi.bulkNonWorkingDays).toHaveBeenCalledWith([
      { date: '2026-08-17', name: 'HUT RI' },
    ])
    expect(importPreview.value).toEqual([])
  })
})

describe('closing a period', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    blockingRecords.value = []
    vi.mocked(workPatternApi.getPeriods).mockResolvedValue({
      data: { data: [] },
    } as never)
  })

  it('closes a complete month', async () => {
    vi.mocked(workPatternApi.closePeriod).mockResolvedValue({
      data: { data: { status: 'CLOSED' } },
    } as never)

    await expect(workPatternService.closePeriod(2026, 8)).resolves.toBe(true)
    expect(blockingRecords.value).toEqual([])
  })

  // The refusal carries the blocking records; surfacing them is the difference
  // between "it failed" and "here is what to fix".
  it('surfaces the records that blocked the close', async () => {
    vi.mocked(workPatternApi.closePeriod).mockRejectedValue({
      response: {
        data: {
          incomplete: [
            { userId: 'user-1', displayName: 'Ahmad', date: '2026-08-12' },
          ],
        },
      },
    })

    await expect(workPatternService.closePeriod(2026, 8)).resolves.toBe(false)
    expect(blockingRecords.value).toEqual([
      { userId: 'user-1', displayName: 'Ahmad', date: '2026-08-12' },
    ])
  })

  it('leaves the list empty when the failure carries no records', async () => {
    vi.mocked(workPatternApi.closePeriod).mockRejectedValue(
      new Error('network'),
    )

    await workPatternService.closePeriod(2026, 8)

    expect(blockingRecords.value).toEqual([])
  })
})
