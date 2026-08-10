import { beforeEach, describe, expect, it, vi } from 'vitest'
import { kioskApi } from '../api/kioskApi'
import { kioskService, MAX_FLUSH_BATCH_SIZE } from '../services/kioskService'
import type { QueuedScan } from '../types'

vi.mock('../api/kioskApi', () => ({
  kioskApi: {
    getClockAnchor: vi.fn(),
    scan: vi.fn(),
    flush: vi.fn(),
  },
}))

const TOKEN = 'device-token'

function fakeQueue() {
  const entries: QueuedScan[] = []
  return {
    entries,
    enqueue: vi.fn((scan: QueuedScan) => {
      entries.push(scan)
      return Promise.resolve()
    }),
    // A snapshot, matching IndexedDB's `getAll()` — handing back the live array
    // is what surfaced the aliasing bug this mock now avoids reintroducing.
    all: vi.fn(() => Promise.resolve([...entries])),
    acknowledge: vi.fn((ids: string[]) => {
      for (const id of ids) {
        const index = entries.findIndex((e) => e.clientEventId === id)
        if (index >= 0) entries.splice(index, 1)
      }
      return Promise.resolve()
    }),
    refreshCount: vi.fn(() => Promise.resolve()),
  }
}

function fakeClock(derived: string | null = '2026-08-10T07:00:00.000Z') {
  return {
    anchorId: { value: 'anchor-1' },
    setAnchor: vi.fn(),
    deriveOccurredAt: vi.fn(() => derived),
  }
}

describe('kioskService.submit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends straight through when the network is up', async () => {
    vi.mocked(kioskApi.scan).mockResolvedValue({
      data: { data: { outcome: 'ACCEPTED', direction: 'CHECK_IN' } },
    } as never)
    const queue = fakeQueue()

    const { queued } = await kioskService.submit(
      TOKEN,
      'code',
      fakeClock(),
      queue,
    )

    expect(queued).toBe(false)
    expect(queue.enqueue).not.toHaveBeenCalled()
  })

  // SC-013: the gate keeps working through an outage.
  it('queues the scan when the request fails', async () => {
    vi.mocked(kioskApi.scan).mockRejectedValue(new Error('offline'))
    const queue = fakeQueue()

    const { queued } = await kioskService.submit(
      TOKEN,
      'code',
      fakeClock(),
      queue,
    )

    expect(queued).toBe(true)
    expect(queue.entries).toHaveLength(1)
  })

  // FR-010 / research R3: the queued time comes from a server-anchored
  // monotonic counter, never from the device's wall clock.
  it('stamps a queued scan from the server-anchored clock', async () => {
    vi.mocked(kioskApi.scan).mockRejectedValue(new Error('offline'))
    const queue = fakeQueue()
    const clock = fakeClock('2026-08-10T07:30:00.000Z')

    await kioskService.submit(TOKEN, 'code', clock, queue)

    expect(clock.deriveOccurredAt).toHaveBeenCalled()
    expect(queue.entries[0]).toMatchObject({
      occurredAt: '2026-08-10T07:30:00.000Z',
      clockAnchorId: 'anchor-1',
    })
  })

  // Better to send no time than an invented one — the server stamps it instead.
  it('queues without a timestamp when no anchor was ever obtained', async () => {
    vi.mocked(kioskApi.scan).mockRejectedValue(new Error('offline'))
    const queue = fakeQueue()

    await kioskService.submit(TOKEN, 'code', fakeClock(null), queue)

    expect(queue.entries[0]?.occurredAt).toBeNull()
  })

  it('gives every scan a distinct retry key', async () => {
    vi.mocked(kioskApi.scan).mockRejectedValue(new Error('offline'))
    const queue = fakeQueue()
    const clock = fakeClock()

    await kioskService.submit(TOKEN, 'a', clock, queue)
    await kioskService.submit(TOKEN, 'b', clock, queue)

    expect(queue.entries[0]?.clientEventId).not.toBe(
      queue.entries[1]?.clientEventId,
    )
  })
})

describe('kioskService.flush', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clears exactly the entries the server settled', async () => {
    const queue = fakeQueue()
    queue.entries.push(
      { clientEventId: 'e1', code: 'a', occurredAt: null, clockAnchorId: null },
      { clientEventId: 'e2', code: 'b', occurredAt: null, clockAnchorId: null },
    )
    vi.mocked(kioskApi.flush).mockResolvedValue({
      data: {
        data: [
          { clientEventId: 'e1', outcome: 'ACCEPTED', accepted: true },
          { clientEventId: 'e2', outcome: 'ACCEPTED', accepted: true },
        ],
      },
    } as never)

    const result = await kioskService.flush(TOKEN, queue)

    expect(result).toEqual({ sent: 2, cleared: 2 })
    expect(queue.entries).toHaveLength(0)
  })

  // A rejected card is a final answer. Keeping it queued would retry it on
  // every reconnect forever.
  it('clears a rejected scan too, because the answer is settled', async () => {
    const queue = fakeQueue()
    queue.entries.push({
      clientEventId: 'e1',
      code: 'revoked',
      occurredAt: null,
      clockAnchorId: null,
    })
    vi.mocked(kioskApi.flush).mockResolvedValue({
      data: {
        data: [
          { clientEventId: 'e1', outcome: 'REJECTED_REVOKED', accepted: true },
        ],
      },
    } as never)

    await kioskService.flush(TOKEN, queue)

    expect(queue.entries).toHaveLength(0)
  })

  // Still offline: the queue must survive untouched for the next attempt.
  it('keeps everything queued when the flush itself fails', async () => {
    const queue = fakeQueue()
    queue.entries.push({
      clientEventId: 'e1',
      code: 'a',
      occurredAt: null,
      clockAnchorId: null,
    })
    vi.mocked(kioskApi.flush).mockRejectedValue(new Error('still offline'))

    const result = await kioskService.flush(TOKEN, queue)

    expect(result).toEqual({ sent: 0, cleared: 0 })
    expect(queue.entries).toHaveLength(1)
    expect(queue.acknowledge).not.toHaveBeenCalled()
  })

  /**
   * SC-013 at the depth it actually happens.
   *
   * A four-hour outage on a busy morning is order 900 scans — past the
   * server's 500-per-batch cap. Sent as one request it comes back a 400, which
   * this code cannot tell from being offline, so the queue would retry forever
   * and lose the whole morning on the one criterion that says zero scans are
   * lost. Asserted here rather than by a four-hour manual run.
   */
  it('drains a four-hour outage in chunks the server will accept', async () => {
    const queue = fakeQueue()
    const depth = 900
    for (let i = 0; i < depth; i++) {
      queue.entries.push({
        clientEventId: `e${i}`,
        code: `card-${i}`,
        occurredAt: null,
        clockAnchorId: null,
      })
    }
    vi.mocked(kioskApi.flush).mockImplementation((_token, scans) =>
      Promise.resolve({
        data: {
          data: scans.map((scan) => ({
            clientEventId: scan.clientEventId,
            outcome: 'ACCEPTED',
            accepted: true,
          })),
        },
      } as never),
    )

    const result = await kioskService.flush(TOKEN, queue)

    expect(result).toEqual({ sent: depth, cleared: depth })
    expect(queue.entries).toHaveLength(0)

    const sizes = vi
      .mocked(kioskApi.flush)
      .mock.calls.map((call) => call[1].length)
    expect(sizes).toEqual([MAX_FLUSH_BATCH_SIZE, depth - MAX_FLUSH_BATCH_SIZE])
    expect(Math.max(...sizes)).toBeLessThanOrEqual(MAX_FLUSH_BATCH_SIZE)
  })

  /**
   * A connection dropping mid-drain is the normal outcome, not an edge case:
   * what landed must stay cleared, or the next reconnect resends it.
   */
  it('keeps what landed when the connection drops between chunks', async () => {
    const queue = fakeQueue()
    for (let i = 0; i < 700; i++) {
      queue.entries.push({
        clientEventId: `e${i}`,
        code: `card-${i}`,
        occurredAt: null,
        clockAnchorId: null,
      })
    }
    vi.mocked(kioskApi.flush)
      .mockResolvedValueOnce({
        data: {
          data: queue.entries.slice(0, MAX_FLUSH_BATCH_SIZE).map((scan) => ({
            clientEventId: scan.clientEventId,
            outcome: 'ACCEPTED',
            accepted: true,
          })),
        },
      } as never)
      .mockRejectedValueOnce(new Error('dropped mid-drain'))

    const result = await kioskService.flush(TOKEN, queue)

    expect(result).toEqual({
      sent: MAX_FLUSH_BATCH_SIZE,
      cleared: MAX_FLUSH_BATCH_SIZE,
    })
    expect(queue.entries).toHaveLength(200)
  })

  it('does nothing when the queue is empty', async () => {
    const queue = fakeQueue()

    await expect(kioskService.flush(TOKEN, queue)).resolves.toEqual({
      sent: 0,
      cleared: 0,
    })
    expect(kioskApi.flush).not.toHaveBeenCalled()
  })
})
