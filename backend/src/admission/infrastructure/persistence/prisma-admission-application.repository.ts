import { ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  AdmissionApplication,
  AdmissionDocumentType,
  AdmissionPayment,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';
import {
  isEligibleAdmissionParent,
  hasCompleteAddress,
} from '../../domain/enroll-as-student.rules.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';
import {
  applicationAdminDetailInclude,
  applicationListInclude,
  ApplicationAdminDetail,
  ApplicationListItem,
} from './prisma-admission-application.includes.js';
import {
  AcceptAdmissionApplicationInput,
  AdmissionApplicationQueryInput,
  AdmissionDocumentWithType,
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
  AdmissionStatusCount,
  AdmissionWaveAcceptedCount,
  ApplicationWithDocsAndPayment,
  ApplicationWithParentsAndUser,
  ApplicationWithWave,
  CreateAdmissionApplicationRepositoryInput,
  EnrollApplicantRepositoryInput,
  EnrollResult,
  IAdmissionApplicationRepository,
  RejectAdmissionApplicationInput,
  UpdateAdmissionApplicationRepositoryInput,
  UpdateAdmissionDocumentStatusInput,
  UpdateAdmissionPaymentStatusInput,
} from '../../domain/interfaces/admission-application-repository.interface.js';

@Injectable()
export class PrismaAdmissionApplicationRepository extends IAdmissionApplicationRepository {
  private readonly logger = new Logger(
    PrismaAdmissionApplicationRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<AdmissionApplication | null> {
    return this.findActiveById(id);
  }

  async findByApplicantId(
    applicantId: string,
  ): Promise<AdmissionApplication | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { userId: applicantId, deletedAt: null },
    });
  }

  async create(
    input: CreateAdmissionApplicationRepositoryInput,
  ): Promise<AdmissionApplication> {
    return this.prisma.admissionApplication.create({ data: input });
  }

  async update(
    id: string,
    input: UpdateAdmissionApplicationRepositoryInput,
  ): Promise<AdmissionApplication> {
    return this.prisma.admissionApplication.update({
      where: { id },
      data: input,
    });
  }

  async remove(id: string): Promise<AdmissionApplication> {
    return this.prisma.admissionApplication.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── Read model ──

  async findAll(
    query: AdmissionApplicationQueryInput,
  ): Promise<PaginatedResult<ApplicationListItem>> {
    const { page = 1, limit = 10, search, status, waveId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AdmissionApplicationWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(waveId && { waveId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { registrationNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.admissionApplication.findMany({
        where,
        skip,
        take: limit,
        include: applicationListInclude,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionApplication.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAdminDetailById(
    id: string,
  ): Promise<ApplicationAdminDetail | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
      include: applicationAdminDetailInclude,
    });
  }

  async countByNik(nik: string, excludeId: string): Promise<number> {
    return this.prisma.admissionApplication.count({
      where: { nik, id: { not: excludeId }, deletedAt: null },
    });
  }

  async findActiveDocumentTypes(): Promise<AdmissionDocumentType[]> {
    return this.prisma.admissionDocumentType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getStatusCounts(waveId?: string): Promise<AdmissionStatusCount[]> {
    const grouped = await this.prisma.admissionApplication.groupBy({
      by: ['status'],
      where: { deletedAt: null, ...(waveId && { waveId }) },
      _count: { _all: true },
    });
    return grouped.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async getWavesWithAcceptedCount(
    waveId?: string,
  ): Promise<AdmissionWaveAcceptedCount[]> {
    const waves = await this.prisma.admissionWave.findMany({
      where: { deletedAt: null, ...(waveId && { id: waveId }) },
      include: {
        _count: {
          select: {
            applications: {
              where: {
                status: { in: ['ACCEPTED', 'ENROLLED'] },
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return waves.map((w) => ({
      id: w.id,
      name: w.name,
      code: w.code,
      quota: w.quota,
      accepted: w._count.applications,
    }));
  }

  // ── Workflow reads ──

  async findActiveById(id: string): Promise<AdmissionApplication | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findActiveWithWave(id: string): Promise<ApplicationWithWave | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
      include: { wave: true },
    });
  }

  async findActiveWithDocsAndPayment(
    id: string,
  ): Promise<ApplicationWithDocsAndPayment | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
      include: { documents: true, payment: true },
    });
  }

  async findActiveWithParentsAndUser(
    id: string,
  ): Promise<ApplicationWithParentsAndUser | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { id, deletedAt: null },
      include: { parents: true, user: true },
    });
  }

  async countAcceptedInWave(waveId: string): Promise<number> {
    return this.prisma.admissionApplication.count({
      where: {
        waveId,
        status: { in: ['ACCEPTED', 'ENROLLED'] },
        deletedAt: null,
      },
    });
  }

  async findRequiredActiveDocumentTypes(): Promise<AdmissionDocumentType[]> {
    return this.prisma.admissionDocumentType.findMany({
      where: { isActive: true, isRequired: true },
    });
  }

  async findDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdmissionDocumentWithType | null> {
    return this.prisma.admissionDocument.findFirst({
      where: { id: documentId, applicationId },
      include: { documentType: true },
    });
  }

  async findPayment(applicationId: string): Promise<AdmissionPayment | null> {
    return this.prisma.admissionPayment.findFirst({ where: { applicationId } });
  }

  async findStudentRoleId(): Promise<string | null> {
    const role = await this.prisma.role.findUnique({
      where: { code: 'STUDENT' },
    });
    return role?.id ?? null;
  }

  async isNisTaken(nis: string): Promise<boolean> {
    return (await this.prisma.student.findUnique({ where: { nis } })) !== null;
  }

  async isNisnTaken(nisn: string): Promise<boolean> {
    return (await this.prisma.student.findUnique({ where: { nisn } })) !== null;
  }

  async isNikTakenInProfiles(nik: string): Promise<boolean> {
    return (await this.prisma.profile.findUnique({ where: { nik } })) !== null;
  }

  // ── Workflow writes ──

  async updateDocumentStatus(
    documentId: string,
    input: UpdateAdmissionDocumentStatusInput,
  ): Promise<AdmissionDocumentWithTypeAndFile> {
    return this.prisma.admissionDocument.update({
      where: { id: documentId },
      data: {
        status: input.status,
        note: input.note,
        verifiedById: input.adminId,
        verifiedAt: new Date(),
      },
      include: { documentType: true, file: true },
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    input: UpdateAdmissionPaymentStatusInput,
  ): Promise<AdmissionPaymentWithProof> {
    return this.prisma.admissionPayment.update({
      where: { id: paymentId },
      data: {
        status: input.status,
        note: input.note,
        verifiedById: input.adminId,
        verifiedAt: new Date(),
      },
      include: { proofFile: true },
    });
  }

  async setRevisionNeeded(
    id: string,
    note: string,
  ): Promise<ApplicationAdminDetail> {
    return this.prisma.admissionApplication.update({
      where: { id },
      data: { status: 'REVISION_NEEDED', revisionNote: note },
      include: applicationAdminDetailInclude,
    });
  }

  async setVerified(
    id: string,
    adminId: string,
  ): Promise<ApplicationAdminDetail> {
    return this.prisma.admissionApplication.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedById: adminId,
        verifiedAt: new Date(),
      },
      include: applicationAdminDetailInclude,
    });
  }

  async setAccepted(
    input: AcceptAdmissionApplicationInput,
  ): Promise<ApplicationAdminDetail> {
    return this.prisma.admissionApplication.update({
      where: { id: input.id },
      data: {
        status: 'ACCEPTED',
        decidedById: input.adminId,
        decidedAt: new Date(),
        decisionNote: input.note,
      },
      include: applicationAdminDetailInclude,
    });
  }

  async setRejected(
    input: RejectAdmissionApplicationInput,
  ): Promise<ApplicationAdminDetail> {
    return this.prisma.admissionApplication.update({
      where: { id: input.id },
      data: {
        status: 'REJECTED',
        decidedById: input.adminId,
        decidedAt: new Date(),
        decisionNote: input.reason,
      },
      include: applicationAdminDetailInclude,
    });
  }

  async enrollAsStudent(
    application: ApplicationWithParentsAndUser,
    dto: EnrollApplicantRepositoryInput,
    studentRoleId: string,
  ): Promise<EnrollResult> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Profile for the applicant's existing user account.
      await tx.profile.create({
        data: {
          userId: application.userId,
          name: application.fullName ?? '',
          nik: application.nik!,
          gender: application.gender!,
          birthPlace: application.birthPlace!,
          birthDate: application.birthDate!,
          email: application.email,
          phone: application.phone,
          religionId: application.religionId,
        },
      });

      // 2. Student on the SAME user account used during admission.
      const student = await tx.student.create({
        data: {
          userId: application.userId,
          nis: dto.nis,
          nisn: dto.nisn,
          status: 'ACTIVE',
          gradeId: dto.gradeId ?? null,
        },
      });

      // 3. Parents (reuse by NIK when possible) + student links. Admission
      //    parents missing required fields are skipped, not blocking.
      let parentsLinked = 0;
      for (const ap of application.parents ?? []) {
        if (!isEligibleAdmissionParent(ap)) {
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

      // 4. Address from the application's domicile section.
      if (hasCompleteAddress(application)) {
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

      // 5. STUDENT role (APPLICANT kept so the admission portal stays usable).
      await tx.userRole.upsert({
        where: {
          userId_roleId: { userId: application.userId, roleId: studentRoleId },
        },
        update: {},
        create: { userId: application.userId, roleId: studentRoleId },
      });

      // 6. Optional classroom enrollment in the active semester.
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

      // 7. Mark the application ENROLLED.
      const updatedApp = await tx.admissionApplication.update({
        where: { id: application.id },
        data: {
          status: 'ENROLLED',
          enrolledStudentId: student.id,
          enrolledAt: new Date(),
        },
      });

      return {
        application: updatedApp,
        student,
        parentsLinked,
        enrollmentCreated,
      };
    });
  }
}
