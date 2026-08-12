import { queryClient, referenceQueryKey } from '../client'
import { REFERENCE_EXPIRY_MS } from '../constants'
import type { ReferenceListKey, ReferenceListStatus } from '../types'

/**
 * Read-through access to a reference list, on TanStack Query.
 *
 * The four guarantees a caller may rely on (contract C3) are now the library's
 * rather than ours:
 *
 * - **Read-through** — `fetchQuery` resolves with the list or rejects. It never
 *   returns an empty array meaning "not loaded yet", which is what makes a
 *   select silently render no options.
 * - **Single flight** — two callers asking for the same key while a request is
 *   in flight share it; TanStack deduplicates on the query key.
 * - **Bounded staleness** — `staleTime` per list, from the table in
 *   `constants`. Inside it, `fetchQuery` returns what is held without a
 *   request; past it, it refetches.
 * - **Write invalidates** — `invalidate` marks the list stale, so the next read
 *   is fresh. What is held stays readable in the meantime, which is why a
 *   select does not blink empty the moment someone saves.
 *
 * This wrapper exists so the call sites read as what they mean — `read` a list,
 * `invalidate` it — and so the key namespace stays in one place. Anything
 * needing the reactive form should use `useQuery` directly with
 * `referenceQueryKey`; the same entry backs both.
 *
 * What it is not: a general query cache. It holds whole reference lists keyed by
 * what they are, so it must not be given a paginated or filtered read — two
 * different filters would collide on one key and serve each other's rows.
 */
export function useReferenceList() {
  async function read<T>(
    key: ReferenceListKey,
    fetcher: () => Promise<T[]>,
  ): Promise<T[]> {
    return queryClient.fetchQuery({
      queryKey: referenceQueryKey(key),
      queryFn: fetcher,
      staleTime: REFERENCE_EXPIRY_MS[key],
    })
  }

  /** Call after creating, updating or deleting a record of this list. */
  function invalidate(key: ReferenceListKey) {
    void queryClient.invalidateQueries({ queryKey: referenceQueryKey(key) })
  }

  /** No list survives a session. */
  function clear() {
    queryClient.clear()
  }

  function statusOf(key: ReferenceListKey): ReferenceListStatus {
    const state = queryClient.getQueryState(referenceQueryKey(key))
    if (!state) return 'idle'
    if (state.fetchStatus === 'fetching') return 'loading'
    if (state.status === 'error') return 'failed'
    if (state.status === 'success') return 'ready'
    return 'idle'
  }

  return { read, invalidate, clear, statusOf }
}
