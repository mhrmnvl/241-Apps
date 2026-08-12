import { ref } from 'vue'
import type { ClockAnchor } from '../types'

/**
 * Derives scan times from a server-anchored monotonic counter.
 *
 * FR-010 says times must not come from the device; SC-013 says they must
 * survive four hours with no server. Those pull against each other, and
 * `performance.now()` resolves it: unlike `Date.now()`, a monotonic counter is
 * unaffected by someone changing the tablet's clock at the gate. The only trust
 * placed in the device is *elapsed duration* since an instant the server gave
 * it, which is far weaker than trusting its idea of what time it is.
 *
 * While online we send no timestamp at all and let the server stamp it. The
 * derivation is only for scans taken during an outage.
 */
export function useServerClock() {
  const anchorId = ref<string | null>(null)
  const anchorServerTime = ref<number | null>(null)
  const anchorMonotonic = ref<number | null>(null)
  const maxOfflineWindowHours = ref(8)

  function setAnchor(anchor: ClockAnchor) {
    anchorId.value = anchor.anchorId
    anchorServerTime.value = new Date(anchor.serverTime).getTime()
    anchorMonotonic.value = performance.now()
    maxOfflineWindowHours.value = anchor.maxOfflineWindowHours
  }

  /**
   * The time to stamp an offline scan with, or null when no anchor has ever
   * been obtained — in which case the scan is queued without one and the server
   * stamps it on arrival. That loses precision but never invents a time.
   */
  function deriveOccurredAt(): string | null {
    if (anchorServerTime.value === null || anchorMonotonic.value === null) {
      return null
    }

    const elapsed = performance.now() - anchorMonotonic.value
    return new Date(anchorServerTime.value + elapsed).toISOString()
  }

  /** True once the anchor is older than the window the server will accept. */
  function isAnchorStale(): boolean {
    if (anchorMonotonic.value === null) return true

    const elapsedHours = (performance.now() - anchorMonotonic.value) / 3_600_000
    return elapsedHours > maxOfflineWindowHours.value
  }

  return {
    anchorId,
    maxOfflineWindowHours,
    setAnchor,
    deriveOccurredAt,
    isAnchorStale,
  }
}
