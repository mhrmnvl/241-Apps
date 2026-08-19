export interface PaginatedResult<T, TSummary = never> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  /**
   * Figures describing the whole filtered set rather than the page in `data`.
   *
   * A caller cannot derive these: it holds one page, so summing what it has
   * gives the page's total and calls it the set's. That is a defect the screen
   * cannot show you — the number looks plausible and moves when you paginate.
   * Anything a header or a summary card states about "all of them" is computed
   * here, next to the query it describes, and travels in `meta`.
   */
  summary?: TSummary;
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
