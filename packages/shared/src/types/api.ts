export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages?: number
}

export interface ApiPaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiSingleResponse<T> {
  data: T
}

export interface ApiEnvelope<T> {
  statusCode: number
  message: string | string[]
  data: T | null
}
