import { REFERENCE_EXPIRY_MS } from '../constants'
import { useReferenceDataStore } from '../stores/referenceDataStore'
import type { CachedList, ReferenceListKey } from '../types'

/**
 * Read-through access to a reference list.
 *
 * The four guarantees a caller may rely on (contract C3):
 *
 * - **Read-through** — `read` resolves with the list or rejects. It never
 *   returns an empty array meaning "not loaded yet", which is the failure mode
 *   that makes a select silently render no options.
 * - **Single flight** — two screens asking in the same tick share one request.
 * - **Bounded staleness** — a held list older than its expiry is refetched.
 * - **Write invalidates** — `invalidate` expires a list after a write, so the
 *   next read is fresh.
 *
 * What it is not: a general query cache. It holds whole reference lists keyed by
 * what they are, so it must not be given a paginated or filtered read — two
 * different filters would collide on one key and serve each other's rows.
 */

function isUsable(
  entry: CachedList | undefined,
  key: ReferenceListKey,
): boolean {
  if (!entry || entry.status !== 'ready') return false
  const expiry = REFERENCE_EXPIRY_MS[key]
  if (expiry === Infinity) return true
  return Date.now() - entry.fetchedAt < expiry
}

export function useReferenceList() {
  const store = useReferenceDataStore()

  async function read<T>(
    key: ReferenceListKey,
    fetcher: () => Promise<T[]>,
  ): Promise<T[]> {
    const held = store.get(key)
    if (isUsable(held, key)) return held!.items as T[]

    // A request already on its way is the answer to this read as well.
    const pending = store.inFlight.get(key)
    if (pending) return pending as Promise<T[]>

    store.setLoading(key)

    const request = fetcher()
      .then((items) => {
        store.setReady(key, items, Date.now())
        return items
      })
      .catch((error: unknown) => {
        // The entry is marked failed rather than left loading, so the next read
        // retries instead of waiting on a request that will never resolve.
        store.setFailed(key)
        throw error
      })
      .finally(() => {
        store.inFlight.delete(key)
      })

    store.inFlight.set(key, request as Promise<unknown[]>)
    return request
  }

  /** Call after creating, updating or deleting a record of this list. */
  function invalidate(key: ReferenceListKey) {
    store.invalidate(key)
  }

  function clear() {
    store.clear()
  }

  function statusOf(key: ReferenceListKey) {
    return store.get(key)?.status ?? 'idle'
  }

  return { read, invalidate, clear, statusOf }
}
