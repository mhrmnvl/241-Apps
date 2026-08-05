export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Domain-side mirror of `shared/dto/pagination.dto.ts`.
 *
 * Repository query contracts extend this instead of depending on the HTTP
 * `PaginationQueryDto`, which carries class-validator/Swagger decorators that
 * have no place behind a domain port.
 */
export interface PaginationQueryInput {
  page?: number;
  limit?: number;
}

/**
 * Pagination envelope returned to HTTP callers.
 *
 * Repositories return the flat `PaginatedResult<T>` shape; use-cases derive
 * `totalPages` and hand this to the controller, which `ResponseInterceptor`
 * passes through untouched (it already carries `data` + `meta`).
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
