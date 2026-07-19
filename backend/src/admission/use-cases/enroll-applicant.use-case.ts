import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { EnrollApplicantDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

/**
 * "Proses Jadi Santri": copies verified admission data into the real student
 * tables in one transaction. Acceptance (ACCEPTED) is the announcement
 * decision; enrollment is the administrative re-registration step that
 * requires a NIS. Mirrors create-student.use-case behavior.
 */
@Injectable()
export class EnrollApplicantUseCase {
  private readonly logger = new Logger(EnrollApplicantUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: EnrollApplicantDto) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { parents: true, user: true },
    });
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

    const [nisExists, nisnExists, nikExists] = await Promise.all([
      this.prisma.student.findUnique({ where: { nis: dto.nis } }),
      this.prisma.student.findUnique({ where: { nisn: dto.nisn } }),
      this.prisma.profile.findUnique({ where: { nik: application.nik } }),
    ]);
    if (nisExists) {
      throw new ConflictException(`NIS ${dto.nis} sudah digunakan`);
    }
    if (nisnExists) {
      throw new ConflictException(`NISN ${dto.nisn} sudah digunakan`);
    }
    if (nikExists) {
      throw new ConflictException(
        `NIK ${application.nik} sudah terdaftar pada profil lain`,
      );
    }

    const studentRole = await this.prisma.role.findUnique({
      where: { code: 'STUDENT' },
    });
    if (!studentRole) {
      throw new ConflictException('Role STUDENT belum tersedia');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Profile for the applicant's existing user account
      await tx.profile.create({
        data: {
          userId: application.userId,
          name: application.fullName,
          nik: application.nik!,
          gender: application.gender!,
          birthPlace: application.birthPlace!,
          birthDate: application.birthDate!,
          email: application.email,
          phone: application.phone,
          religionId: application.religionId,
        },
      });

      // 2. Student on the SAME user, so the santri logs into SIAKAD with
      //    the account created during admission.
      const student = await tx.student.create({
        data: {
          userId: application.userId,
          nis: dto.nis,
          nisn: dto.nisn,
          status: 'ACTIVE',
          gradeId: dto.gradeId ?? null,
        },
      });

      // 3. Parents (reuse by NIK when possible) + student links.
      //    Parent requires nik/birthPlace/birthDate/occupation; admission
      //    parents missing those are skipped rather than blocking enrollment.
      let parentsLinked = 0;
      for (const ap of application.parents) {
        if (!ap.nik || !ap.birthPlace || !ap.birthDate || !ap.occupationId) {
          this.logger.warn(
            `Skipping incomplete admission parent ${ap.relation} for ${application.registrationNumber}`,
          );
          continue;
        }
        let parent = await tx.parent.findUnique({ where: { nik: ap.nik } });
        parent ??= await tx.parent.create({
          data: {
            name: ap.name,
            nik: ap.nik,
            birthPlace: ap.birthPlace,
            birthDate: ap.birthDate,
            phone: ap.phone,
            occupationId: ap.occupationId,
            educationId: ap.educationId,
            income: ap.income,
          },
        });
        await tx.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            relation: ap.relation,
            isPrimary: ap.isPrimary,
          },
        });
        parentsLinked++;
      }

      // 4. Address from the application's domicile section
      if (
        application.street &&
        application.rt &&
        application.rw &&
        application.village &&
        application.district &&
        application.city &&
        application.province
      ) {
        await tx.address.create({
          data: {
            studentId: student.id,
            street: application.street,
            rt: application.rt,
            rw: application.rw,
            village: application.village,
            district: application.district,
            city: application.city,
            province: application.province,
            postalCode: application.postalCode ?? '',
            isPrimary: true,
          },
        });
      }

      // 5. STUDENT role (APPLICANT kept so the admission portal stays accessible)
      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: application.userId,
            roleId: studentRole.id,
          },
        },
        update: {},
        create: { userId: application.userId, roleId: studentRole.id },
      });

      // 6. Optional classroom enrollment in the active semester
      let enrollmentCreated = false;
      if (dto.classroomId) {
        const activeSemester = await tx.semester.findFirst({
          where: { isActive: true, deletedAt: null },
        });
        if (!activeSemester) {
          throw new ConflictException(
            'Tidak ada semester aktif untuk pendaftaran kelas',
          );
        }
        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            classroomId: dto.classroomId,
            semesterId: activeSemester.id,
            status: 'ACTIVE',
          },
        });
        enrollmentCreated = true;
      }

      // 7. Mark the application ENROLLED
      const updatedApp = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ENROLLED',
          enrolledStudentId: student.id,
          enrolledAt: new Date(),
        },
      });

      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Selamat datang, santri baru!',
        `Anda telah resmi terdaftar sebagai santri dengan NIS ${dto.nis}. Akun ini sekarang dapat digunakan untuk masuk ke aplikasi akademik.`,
        tx,
      );

      return {
        application: updatedApp,
        student,
        parentsLinked,
        enrollmentCreated,
      };
    });

    this.logger.log(
      `Applicant ${application.registrationNumber} enrolled as student NIS ${dto.nis}`,
    );

    return result;
  }
}
