import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { PasswordManagerService } from '../../platform/auth/services/password-manager.service.js';
import { RegisterApplicantDto } from '../dto/register-applicant.dto.js';

@Injectable()
export class RegisterApplicantUseCase {
  private readonly logger = new Logger(RegisterApplicantUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordManager: PasswordManagerService,
  ) {}

  async execute(dto: RegisterApplicantDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Konfirmasi kata sandi tidak cocok');
    }

    const today = new Date();
    const wave = await this.prisma.admissionWave.findFirst({
      where: {
        id: dto.waveId,
        isActive: true,
        deletedAt: null,
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });
    if (!wave) {
      throw new BadRequestException(
        'Gelombang pendaftaran tidak ditemukan atau sudah ditutup',
      );
    }

    const identifier = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar. Silakan login.');
    }

    const applicantRole = await this.prisma.role.findUnique({
      where: { code: 'APPLICANT' },
    });
    if (!applicantRole) {
      throw new InternalServerErrorException(
        'Role APPLICANT belum tersedia. Hubungi administrator.',
      );
    }

    const passwordHash = await this.passwordManager.hashPassword(dto.password);

    const application = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { identifier, passwordHash, isActive: true },
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: applicantRole.id },
      });

      const updatedWave = await tx.admissionWave.update({
        where: { id: wave.id },
        data: { lastRegistrationSeq: { increment: 1 } },
      });
      const registrationNumber = `${wave.code}-${String(
        updatedWave.lastRegistrationSeq,
      ).padStart(4, '0')}`;

      const app = await tx.admissionApplication.create({
        data: {
          userId: user.id,
          waveId: wave.id,
          registrationNumber,
          status: 'DRAFT',
          fullName: dto.fullName,
          email: identifier,
          phone: dto.phone ?? null,
        },
      });

      await tx.admissionPayment.create({
        data: {
          applicationId: app.id,
          amount: wave.registrationFee,
          status: 'UNPAID',
        },
      });

      await tx.admissionNotification.create({
        data: {
          applicationId: app.id,
          type: 'GENERAL',
          title: 'Selamat datang di pendaftaran santri baru',
          message: `Akun Anda berhasil dibuat dengan nomor pendaftaran ${registrationNumber}. Silakan lengkapi formulir, unggah berkas, dan lakukan pembayaran.`,
        },
      });

      return app;
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
