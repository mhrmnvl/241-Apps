import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AcademicSettingEntity } from '../../domain/entities/academic-setting.entity.js';
import {
  AcademicSettingRepositoryInput,
  IAcademicSettingRepository,
} from '../../domain/interfaces/academic-setting-repository.interface.js';

@Injectable()
export class PrismaAcademicSettingRepository extends IAcademicSettingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async find(): Promise<AcademicSettingEntity | null> {
    return this.prisma.academicSetting.findFirst();
  }

  async update(
    id: string,
    input: AcademicSettingRepositoryInput,
  ): Promise<AcademicSettingEntity> {
    return this.prisma.academicSetting.update({
      where: { id },
      data: {
        // Compared against undefined, not truthiness: an empty array is a real
        // answer — school runs every day — and would otherwise be skipped.
        ...(input.weeklyHolidays !== undefined && {
          weeklyHolidays: input.weeklyHolidays,
        }),
      },
    });
  }
}
