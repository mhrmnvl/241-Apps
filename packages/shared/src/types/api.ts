export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages?: number
}

/**
 * `M` widens `meta` for endpoints that also return figures about the whole
 * filtered set — counts and averages a caller holding one page cannot work out
 * for itself. It defaults to plain pagination, so existing callers are
 * unaffected.
 */
export interface ApiPaginatedResponse<
  T,
  M extends PaginationMeta = PaginationMeta,
> {
  data: T[]
  meta: M
}

export interface ApiSingleResponse<T> {
  data: T
}

export interface ApiEnvelope<T> {
  statusCode: number
  message: string | string[]
  data: T | null
}
