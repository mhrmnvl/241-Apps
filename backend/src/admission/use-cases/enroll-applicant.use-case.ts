import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { EnrollApplicantDto } from '../dto/request/admin-actions.dto.js';
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
    private readonly repository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: EnrollApplicantDto) {
    const application =
      await this.repository.findActiveWithParentsAndUser(applicationId);
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'ENROLLED');

    if (
      !application.gender ||
      !application.birthPlace ||
      !application.birthDate
    ) {
      throw new BadRequestException(
        'Data diri pendaftar belum lengkap (jenis kelamin, tempat/tanggal lahir)',
      );
    }
    if (!application.nik) {
      throw new BadRequestException(
        'NIK pendaftar wajib diisi sebelum diproses',
      );
    }

    const [nisTaken, nisnTaken, nikTaken] = await Promise.all([
      this.repository.isNisTaken(dto.nis),
      this.repository.isNisnTaken(dto.nisn),
      this.repository.isNikTakenInProfiles(application.nik),
    ]);
    if (nisTaken) {
      throw new ConflictException(`NIS ${dto.nis} sudah digunakan`);
    }
    if (nisnTaken) {
      throw new ConflictException(`NISN ${dto.nisn} sudah digunakan`);
    }
    if (nikTaken) {
      throw new ConflictException(
        `NIK ${application.nik} sudah terdaftar pada profil lain`,
      );
    }

    const studentRoleId = await this.repository.findStudentRoleId();
    if (!studentRoleId) {
      throw new ConflictException('Role STUDENT belum tersedia');
    }

    const result = await this.repository.enrollAsStudent(
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
