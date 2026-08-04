import { ConflictException } from '@nestjs/common';

/** Raised when a NISN is already held by another live student. */
export class StudentNisnAlreadyExistsException extends ConflictException {
  constructor(nisn: string) {
    super(`NISN "${nisn}" is already registered`);
  }
}
