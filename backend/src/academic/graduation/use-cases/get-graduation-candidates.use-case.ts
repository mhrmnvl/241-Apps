import { Injectable } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import type { GraduationCandidateList } from '../domain/interfaces/graduation-repository.interface.js';

/**
 * Who may be graduated — the list the bulk screen offers.
 *
 * Takes no term. The active semester is the answer, and the response says which
 * one it used so the screen can show it rather than ask for it.
 */
@Injectable()
export class GetGraduationCandidatesUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}

  async execute(): Promise<GraduationCandidateList> {
    return this.graduationRepository.findCandidates();
  }
}
