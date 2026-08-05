import { NotFoundException } from '@nestjs/common';

/** Raised when an address id does not belong to the given student. */
export class StudentAddressNotFoundException extends NotFoundException {
  constructor(addressId: string) {
    super(`Address with ID ${addressId} not found for this student`);
  }
}
