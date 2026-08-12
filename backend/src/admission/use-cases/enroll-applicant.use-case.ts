import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { EnrollApplicantDto } from '../dto/request/enroll-applicant.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

/**
 * "Proses Jadi Santri": copies verified admission data into the real student
 * tables in one transaction (owned by the repository). Acceptance (ACCEPTED)
 * is the announcement decision; enrollment is the administrative
 * re-registration step that requires a NIS.
 */
@Injectable()
export class EnrollApplicantUseCase {
  private readonly logger = new Logger(EnrollApplicantUseCase.name);

  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: EnrollApplicantDto) {
    const application =
      await this.admissionApplicationRepository.findActiveWithParentsAndUser(
        applicationId,
      );
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    assertTransition(application.status, 'ENROLLED');

    if (
      !application.gender ||
      !application.birthPlace ||
      !application.birthDate
    ) {
      throw new BadRequestException(
        'Applicant profile is incomplete (gender, place and date of birth)',
      );
    }
    if (!application.nik) {
      throw new BadRequestException(
        'A national ID is required before the applicant can be processed',
      );
    }

    const [nisTaken, nisnTaken, nikTaken] = await Promise.all([
      this.admissionApplicationRepository.isNisTaken(dto.nis),
      this.admissionApplicationRepository.isNisnTaken(dto.nisn),
      this.admissionApplicationRepository.isNikTakenInProfiles(application.nik),
    ]);
    if (nisTaken) {
      throw new ConflictException(`NIS ${dto.nis} is already in use`);
    }
    if (nisnTaken) {
      throw new ConflictException(`NISN ${dto.nisn} is already in use`);
    }
    if (nikTaken) {
      throw new ConflictException(
        `NIK ${application.nik} is already registered to another profile`,
      );
    }

    const studentRoleId =
      await this.admissionApplicationRepository.findStudentRoleId();
    if (!studentRoleId) {
      throw new ConflictException('The STUDENT role has not been provisioned');
    }

    const result = await this.admissionApplicationRepository.enrollAsStudent(
      application,
      dto,
      studentRoleId,
    );

    await this.notifications.notify(
      application.id,
      'STATUS_CHANGE',
      'Selamat datang, santri baru!',
      `Anda telah resmi terdaftar sebagai santri dengan NIS ${dto.nis}. Akun ini sekarang dapat digunakan untuk masuk ke aplikasi akademik.`,
    );

    this.logger.log(
      `Applicant ${application.registrationNumber} enrolled as student NIS ${dto.nis}`,
    );

    return result;
  }
}
