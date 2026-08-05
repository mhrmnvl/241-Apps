import { NotFoundException } from '@nestjs/common';

/** Raised when a student–parent link id does not resolve to a live row. */
export class StudentParentLinkNotFoundException extends NotFoundException {
  constructor(linkId: string) {
    super(`Student-parent link with ID ${linkId} not found`);
  }
}
