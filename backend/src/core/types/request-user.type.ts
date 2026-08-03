/**
 * The caller's identity narrowed to what ownership checks need.
 *
 * Use cases that scope a read to "the requester's own record" take this rather
 * than the full {@link AuthenticatedUser}, so they depend on nothing more than
 * the id they actually compare against.
 */
export interface RequestUser {
  id: string;
}
