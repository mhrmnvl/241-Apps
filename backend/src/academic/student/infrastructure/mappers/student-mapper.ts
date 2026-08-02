import { Student } from '@prisma/client';
import { StudentEntity } from '../../domain/entities/student.entity.js';
import { StudentStatusEnum } from '../../../../shared/domain/enums/student-status.enum.js';

export class StudentMapper {
  static toDomain(prismaStudent: Student): StudentEntity {
    return {
      id: prismaStudent.id,
      userId: prismaStudent.userId,
      nis: prismaStudent.nis,
      nisn: prismaStudent.nisn,
      status: prismaStudent.status,
      gradeId: prismaStudent.gradeId,
      deletedAt: prismaStudent.deletedAt,
    };
  }
}
