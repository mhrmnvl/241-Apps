import { Injectable } from '@nestjs/common';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class GetPublishedAnnouncementsUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
  ) {}

  async execute(userId: string) {
    return this.admissionApplicantRepository.findPublishedAnnouncementsForUser(
      userId,
    );
  }
}
