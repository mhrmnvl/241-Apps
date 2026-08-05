import { InternalServerErrorException } from '@nestjs/common';

/**
 * Raised when the repository created the user row but returned no student —
 * an invariant violation rather than a client error, hence a 500.
 */
export class StudentCreationFailedException extends InternalServerErrorException {
  constructor() {
    super('Student creation failed: user was created without a student record');
  }
}
