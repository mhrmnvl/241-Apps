import { Semester } from '@prisma/client';
import { SemesterEntity } from '../../domain/entities/semester.entity.js';

export class SemesterMapper {
  static toDomain(prismaSemester: Semester): SemesterEntity {
    return new SemesterEntity(
      prismaSemester.id,
      prismaSemester.academicYearId,
      prismaSemester.typeId,
      prismaSemester.isActive,
      prismaSemester.startDate,
      prismaSemester.endDate,
    );
  }
}
