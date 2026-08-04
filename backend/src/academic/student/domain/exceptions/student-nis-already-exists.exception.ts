import { ConflictException } from '@nestjs/common';

/** Raised when a NIS is already held by another live student. */
export class StudentNisAlreadyExistsException extends ConflictException {
  constructor(nis: string) {
    super(`NIS "${nis}" is already registered`);
  }
}
