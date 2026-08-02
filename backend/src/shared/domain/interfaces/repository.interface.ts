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
