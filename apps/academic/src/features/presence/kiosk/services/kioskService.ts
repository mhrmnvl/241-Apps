import { kioskApi } from '../api/kioskApi'
import type { QueuedScan, ScanResult } from '../types'

const TOKEN_KEY = 'presence_kiosk_device_token'

export interface ScanQueuePort {
  enqueue: (scan: QueuedScan) => Promise<void>
  all: () => Promise<QueuedScan[]>
  acknowledge: (ids: string[]) => Promise<void>
  refreshCount: () => Promise<void>
}

export interface ClockPort {
  anchorId: { value: string | null }
  setAnchor: (anchor: {
    serverTime: string
    anchorId: string
    maxOfflineWindowHours: number
  }) => void
  deriveOccurredAt: () => string | null
}

/**
 * Mirrors `MAX_SCAN_BATCH_SIZE` in the backend's presence constants.
 *
 * The server refuses a larger batch with a 400, and a 400 is indistinguishable
 * here from being offline — so a queue past this size would retry forever and
 * never drain. A four-hour outage on a busy morning is order 900 scans, well
 * past it, which is exactly the case SC-013 covers.
 */
export const MAX_FLUSH_BATCH_SIZE = 500

/** Queued rather than answered — the gate keeps working while the network is out. */
export const QUEUED: ScanResult = {
  outcome: 'ACCEPTED',
  direction: 'NONE',
  dayStatus: 'PRESENT',
  lateMinutes: 0,
  recordedAt: '',
}

export const kioskService = {
  readToken: () => localStorage.getItem(TOKEN_KEY),
  saveToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  /**
   * Fetches a fresh clock anchor. Failing is not fatal — the device simply has
   * no anchor and any offline scan is queued unstamped for the server to time
   * on arrival, which loses precision but never invents a time.
   */
  syncClock: async (token: string, clock: ClockPort): Promise<boolean> => {
    try {
      const res = await kioskApi.getClockAnchor(token)
      if (res.data?.data) {
        clock.setAnchor(res.data.data)
        return true
      }
      return false
    } catch {
      return false
    }
  },

  /**
   * Tries the network first, queues on failure.
   *
   * A rejection comes back as a *result*, not an error, so an invalid card is
   * answered on screen and never queued. Only a transport failure queues —
   * otherwise a revoked card would be retried forever (research R4).
   */
  submit: async (
    token: string,
    code: string,
    clock: ClockPort,
    queue: ScanQueuePort,
  ): Promise<{ result: ScanResult; queued: boolean }> => {
    const scan: QueuedScan = {
      clientEventId: crypto.randomUUID(),
      code,
      occurredAt: null,
      clockAnchorId: null,
    }

    try {
      const res = await kioskApi.scan(token, scan)
      return { result: res.data.data, queued: false }
    } catch {
      await queue.enqueue({
        ...scan,
        occurredAt: clock.deriveOccurredAt(),
        clockAnchorId: clock.anchorId.value,
      })
      return {
        result: { ...QUEUED, recordedAt: new Date().toISOString() },
        queued: true,
      }
    }
  },

  /**
   * Sends everything queued and clears exactly what the server settled.
   *
   * Sent in chunks the server will accept rather than in one request: a whole
   * morning is larger than its cap, and an oversized batch comes back as a 400
   * that this code cannot tell from being offline — so the queue would retry
   * forever and drain never. Each chunk is acknowledged as it lands, so a
   * connection dropping halfway still clears what actually arrived.
   *
   * A rejected scan counts as settled: the answer is final, so leaving it in
   * the queue would retry it every reconnect forever.
   */
  flush: async (
    token: string,
    queue: ScanQueuePort,
  ): Promise<{ sent: number; cleared: number }> => {
    // Snapshotted before acknowledging: a queue implementation that hands back
    // a live array rather than a copy would otherwise shrink under the loop as
    // entries are cleared out from under it.
    const pending = await queue.all()
    let sent = 0
    let cleared = 0

    for (let from = 0; from < pending.length; from += MAX_FLUSH_BATCH_SIZE) {
      const chunk = pending.slice(from, from + MAX_FLUSH_BATCH_SIZE)

      try {
        const res = await kioskApi.flush(token, chunk)
        const settled = (res.data?.data ?? [])
          .filter((entry) => entry.accepted)
          .map((entry) => entry.clientEventId)

        await queue.acknowledge(settled)
        sent += chunk.length
        cleared += settled.length
      } catch {
        // Still offline. What is left stays queued and the next reconnect
        // retries it; the unique (deviceId, clientEventId) constraint makes
        // resending an already-settled scan safe.
        break
      }
    }

    return { sent, cleared }
  },
}
