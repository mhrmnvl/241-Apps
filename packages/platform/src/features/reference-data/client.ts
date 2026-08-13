import { QueryClient } from '@tanstack/vue-query'
import type { ReferenceListKey } from './types'

/**
 * The application's single query client.
 *
 * Created here rather than left to `VueQueryPlugin`'s default so that code
 * outside a component can reach it. `useQueryClient()` resolves through Vue's
 * `inject`, which needs an active component instance — and the reference lists
 * are read from services, which are plain objects called imperatively. Handing
 * the plugin a client we own means both work: components may `useQuery` for the
 * reactive form, services call `fetchQuery` on this instance.
 *
 * Each app installs it once:
 *
 *   app.use(VueQueryPlugin, { queryClient })
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // One retry, not the default three. A dialog waiting on a list has a
      // person in front of it; three backed-off attempts turn a dead network
      // into ten seconds of nothing before the error is finally shown.
      retry: 1,
      retryDelay: 400,
      // Reference lists are held for the session and dropped at sign-out, so
      // there is nothing for garbage collection to reclaim in between. Staleness
      // is decided per list — see REFERENCE_EXPIRY_MS.
      gcTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * The key a reference list is held under.
 *
 * Namespaced so that adopting `useQuery` for anything else — a paginated table,
 * a detail record — cannot collide with these.
 */
export const referenceQueryKey = (key: ReferenceListKey) =>
  ['reference', key] as const
