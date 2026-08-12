import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CachedList, ReferenceListKey } from '../types'

/**
 * Holds the reference lists for the lifetime of a session.
 *
 * The store is state only — the decision of whether a held list may be used is
 * `useReferenceList`'s, so that the rule lives in one place rather than in
 * every caller. In-flight requests are kept outside the reactive state on
 * purpose: a Promise is not something a component should be able to render, and
 * it must not be cloned by Pinia's reactivity.
 */
export const useReferenceDataStore = defineStore('reference-data', () => {
  const lists = ref<Partial<Record<ReferenceListKey, CachedList>>>({})

  /** Not reactive: single-flight bookkeeping, never rendered. */
  const inFlight = new Map<ReferenceListKey, Promise<unknown[]>>()

  function get(key: ReferenceListKey): CachedList | undefined {
    return lists.value[key]
  }

  function setLoading(key: ReferenceListKey) {
    const existing = lists.value[key]
    lists.value[key] = {
      key,
      // Keep what is held while refreshing, so a screen never blinks empty.
      items: existing?.items ?? [],
      fetchedAt: existing?.fetchedAt ?? 0,
      status: 'loading',
    }
  }

  function setReady(key: ReferenceListKey, items: unknown[], now: number) {
    lists.value[key] = { key, items, fetchedAt: now, status: 'ready' }
  }

  function setFailed(key: ReferenceListKey) {
    const existing = lists.value[key]
    lists.value[key] = {
      key,
      items: existing?.items ?? [],
      fetchedAt: existing?.fetchedAt ?? 0,
      status: 'failed',
    }
  }

  /**
   * Marks a list stale without discarding it: the next read refetches, and
   * anything rendering it in the meantime keeps the previous values rather than
   * emptying.
   */
  function invalidate(key: ReferenceListKey) {
    const existing = lists.value[key]
    if (!existing) return
    lists.value[key] = { ...existing, fetchedAt: 0, status: 'idle' }
  }

  function clear() {
    lists.value = {}
    inFlight.clear()
  }

  return {
    lists,
    inFlight,
    get,
    setLoading,
    setReady,
    setFailed,
    invalidate,
    clear,
  }
})
