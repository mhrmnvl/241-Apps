import { Semester } from '@prisma/client';
import { SemesterEntity } from '../../domain/entities/semester.entity.js';

export class SemesterMapper {
  static toDomain(prismaSemester: Semester): SemesterEntity {
    return {
      id: prismaSemester.id,
      academicYearId: prismaSemester.academicYearId,
      typeId: prismaSemester.typeId,
      isActive: prismaSemester.isActive,
      startDate: prismaSemester.startDate,
      endDate: prismaSemester.endDate,
      deletedAt: prismaSemester.deletedAt,
    };
  }
}
