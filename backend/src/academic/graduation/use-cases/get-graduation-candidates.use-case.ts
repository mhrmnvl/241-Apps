import { Injectable } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import type { GraduationCandidate } from '../domain/interfaces/graduation-repository.interface.js';

/** Who may be graduated from a semester — the list the bulk screen offers. */
@Injectable()
export class GetGraduationCandidatesUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}

  async execute(semesterId: string): Promise<GraduationCandidate[]> {
    return this.graduationRepository.findCandidates(semesterId);
  }
}
