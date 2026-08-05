import { TeachingAssignmentWithDetails } from '../entities/teaching-assignment.entity.js';

/**
 * Why a requested classroom produced no new assignment.
 *
 * Only duplicates land here — a missing classroom or a year mismatch is a bad
 * request and fails the whole call, since it means the caller sent something
 * that could never be valid.
 */
export const SKIP_ALREADY_ASSIGNED = 'ALREADY_ASSIGNED';

export interface SkippedClassroom {
  classroomId: string;
  reason: typeof SKIP_ALREADY_ASSIGNED;
}

/**
 * Result of assigning one teacher across several classrooms at once.
 *
 * Partial success is normal: picking six classes when two are already covered
 * creates four and reports the other two, rather than rejecting the lot.
 */
export interface BulkAssignmentResult {
  created: TeachingAssignmentWithDetails[];
  skipped: SkippedClassroom[];
}
