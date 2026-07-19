import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service.js';
import { isEditable } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { UpdateMyApplicationDto } from '../dto/update-my-application.dto.js';

@Injectable()
export class UpdateMyApplicationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: UpdateMyApplicationDto) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Formulir hanya dapat diubah saat status Draft atau Perlu Revisi',
      );
    }

    const { parents, birthDate, ...fields } = dto;

    const data: Prisma.AdmissionApplicationUpdateInput = {
      ...fields,
      ...(birthDate !== undefined && { birthDate: new Date(birthDate) }),
    };

    return this.prisma.$transaction(async (tx) => {
      await tx.admissionApplication.update({
        where: { id: application.id },
        data,
      });

      if (parents !== undefined) {
        await tx.admissionApplicationParent.deleteMany({
          where: { applicationId: application.id },
        });
        for (const p of parents) {
          await tx.admissionApplicationParent.create({
            data: {
              applicationId: application.id,
              relation: p.relation,
              name: p.name,
              nik: p.nik ?? null,
              birthPlace: p.birthPlace ?? null,
              birthDate: p.birthDate ? new Date(p.birthDate) : null,
              phone: p.phone ?? null,
              occupationId: p.occupationId ?? null,
              educationId: p.educationId ?? null,
              income: p.income ?? null,
              isPrimary: p.isPrimary ?? false,
            },
          });
        }
      }

      const updated = await tx.admissionApplication.findUniqueOrThrow({
        where: { id: application.id },
        include: applicationDetailInclude,
      });
      return serializeApplicationDetail(updated);
    });
  }
}
