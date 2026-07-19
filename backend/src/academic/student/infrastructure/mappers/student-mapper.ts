import { Student } from '@prisma/client';
import { StudentEntity } from '../../domain/entities/student.entity.js';
import { StudentStatus } from '../../domain/enums/student-status.enum.js';

export class StudentMapper {
  static toDomain(prismaStudent: Student): StudentEntity {
    return new StudentEntity(
      prismaStudent.id,
      prismaStudent.userId,
      prismaStudent.nis,
      prismaStudent.nisn,
      prismaStudent.status as StudentStatus,
      prismaStudent.gradeId,
    );
  }
}
