import { Injectable } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import type { GraduationHoldRecord } from '../domain/interfaces/graduation-repository.interface.js';

/**
 * Who the school decided not to graduate, and why.
 *
 * The reason for a hold is written once, at the end of a year, by whoever ran
 * the screen — and the person who needs it is whoever runs the screen a year
 * later, looking at the same student and wondering what happened. So it is
 * read back by year rather than only in aggregate.
 *
 * No year means every year: a student held twice is exactly the case worth
 * seeing whole.
 */
@Injectable()
export class GetGraduationHoldsUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}

  async execute(academicYearId?: string): Promise<GraduationHoldRecord[]> {
    return this.graduationRepository.findHolds(academicYearId);
  }
}
