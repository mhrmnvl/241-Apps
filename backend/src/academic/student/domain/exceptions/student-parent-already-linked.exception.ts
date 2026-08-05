import { ConflictException } from '@nestjs/common';

/** Raised when the same parent is linked to the same student twice. */
export class StudentParentAlreadyLinkedException extends ConflictException {
  constructor() {
    super('This parent is already linked to the specified student');
  }
}
