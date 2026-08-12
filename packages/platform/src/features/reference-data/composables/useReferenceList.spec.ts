import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useReferenceList } from './useReferenceList'
import { useReferenceDataStore } from '../stores/referenceDataStore'
import { REFERENCE_EXPIRY_MS } from '../constants'

/**
 * The four guarantees of contract C3, one test each, plus the expiry table.
 *
 * Every case counts *requests*, not values — the point of the cache is what it
 * does not ask for, and an assertion on the returned list would pass just as
 * well with no cache at all.
 */

function countingFetcher(items: string[] = ['a', 'b']) {
  const fetcher = vi.fn(() => Promise.resolve(items))
  return fetcher
}

describe('useReferenceList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useRealTimers()
  })

  it('serves a second read inside the expiry window without requesting', async () => {
    const { read } = useReferenceList()
    const fetcher = countingFetcher()

    await read('classrooms', fetcher)
    const second = await read('classrooms', fetcher)

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(second).toEqual(['a', 'b'])
  })

  it('issues exactly one request for two simultaneous reads of a cold list', async () => {
    const { read } = useReferenceList()
    let resolve!: (items: string[]) => void
    const fetcher = vi.fn(
      () =>
        new Promise<string[]>((r) => {
          resolve = r
        }),
    )

    const first = read('teachers', fetcher)
    const second = read('teachers', fetcher)
    resolve(['ahmad'])

    expect(await first).toEqual(['ahmad'])
    expect(await second).toEqual(['ahmad'])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('requests again once the expiry window has passed', async () => {
    vi.useFakeTimers()
    const { read } = useReferenceList()
    const fetcher = countingFetcher()

    await read('classrooms', fetcher)
    vi.setSystemTime(Date.now() + REFERENCE_EXPIRY_MS.classrooms + 1)
    await read('classrooms', fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('never expires a list whose expiry is the session', async () => {
    vi.useFakeTimers()
    const { read } = useReferenceList()
    const fetcher = countingFetcher()

    await read('religions', fetcher)
    vi.setSystemTime(Date.now() + 30 * 24 * 60 * 60_000)
    await read('religions', fetcher)

    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refetches after an invalidation, and empties on clear', async () => {
    const { read, invalidate, clear } = useReferenceList()
    const fetcher = countingFetcher()

    await read('subjects', fetcher)
    invalidate('subjects')
    await read('subjects', fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)

    clear()
    expect(useReferenceDataStore().get('subjects')).toBeUndefined()
    await read('subjects', fetcher)
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  /**
   * An invalidated list keeps its values on purpose: a select that empties
   * itself the moment someone saves a record is worse than one showing a row
   * that is a second out of date.
   */
  it('keeps the previous values while a list is invalid', async () => {
    const { read, invalidate } = useReferenceList()

    await read('grades', countingFetcher(['VII']))
    invalidate('grades')

    expect(useReferenceDataStore().get('grades')?.items).toEqual(['VII'])
  })

  it('rejects on failure and lets the next read retry', async () => {
    const { read, statusOf } = useReferenceList()
    const failing = vi.fn(() => Promise.reject(new Error('offline')))

    await expect(read('positions', failing)).rejects.toThrow('offline')
    expect(statusOf('positions')).toBe('failed')

    const succeeding = countingFetcher(['Kepala Sekolah'])
    await expect(read('positions', succeeding)).resolves.toEqual([
      'Kepala Sekolah',
    ])
    expect(succeeding).toHaveBeenCalledTimes(1)
  })

  /**
   * A key with no expiry would be read from `undefined` and compared against
   * `NaN`, which is falsy — so the list would silently never cache.
   */
  it('states an expiry for every list it can hold', () => {
    const entries = Object.values(REFERENCE_EXPIRY_MS)
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.every((ms) => ms > 0)).toBe(true)
  })
})
