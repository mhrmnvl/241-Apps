import { NotFoundException } from '@nestjs/common';

/**
 * Raised when a student id does not resolve to a live (non soft-deleted) row.
 *
 * Extends the framework's `NotFoundException` so the HTTP status and the
 * existing exception filter keep working unchanged — the subclass exists to
 * name the domain rule, not to alter transport behaviour.
 */
export class StudentNotFoundException extends NotFoundException {
  constructor(studentId: string) {
    super(`Student with ID ${studentId} not found`);
  }
}
