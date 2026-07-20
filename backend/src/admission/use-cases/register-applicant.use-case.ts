import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PasswordManagerService } from '../../platform/auth/services/password-manager.service.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';
import { RegisterApplicantDto } from '../dto/register-applicant.dto.js';

@Injectable()
export class RegisterApplicantUseCase {
  private readonly logger = new Logger(RegisterApplicantUseCase.name);

  constructor(
    private readonly repository: IAdmissionApplicantRepository,
    private readonly passwordManager: PasswordManagerService,
  ) {}

  async execute(dto: RegisterApplicantDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Konfirmasi kata sandi tidak cocok');
    }

    const wave = await this.repository.findOpenWave(dto.waveId);
    if (!wave) {
      throw new BadRequestException(
        'Gelombang pendaftaran tidak ditemukan atau sudah ditutup',
      );
    }

    const identifier = dto.email.trim().toLowerCase();
    const existingUser =
      await this.repository.findActiveUserByIdentifier(identifier);
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar. Silakan login.');
    }

    const applicantRoleId = await this.repository.findApplicantRoleId();
    if (!applicantRoleId) {
      throw new InternalServerErrorException(
        'Role APPLICANT belum tersedia. Hubungi administrator.',
      );
    }

    const passwordHash = await this.passwordManager.hashPassword(dto.password);

    const application = await this.repository.registerApplicant({
      wave,
      identifier,
      passwordHash,
      applicantRoleId,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
    });

    this.logger.log(
      `Applicant registered: ${identifier} (${application.registrationNumber})`,
    );

    return {
      id: application.id,
      registrationNumber: application.registrationNumber,
      identifier,
    };
  }
}
