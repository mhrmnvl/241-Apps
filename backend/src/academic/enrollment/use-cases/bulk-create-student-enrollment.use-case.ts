import { Injectable } from '@nestjs/common';
import { BulkCreateStudentEnrollmentDto } from '../dto/request/bulk-create-student-enrollment.dto.js';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class BulkCreateStudentEnrollmentUseCase {
  constructor(private readonly repository: IEnrollmentRepository) {}
  async execute(dto: BulkCreateStudentEnrollmentDto) {
    const toCreate: CreateStudentEnrollmentDto[] = [];
    const skipped: string[] = [];
    const restored: string[] = [];

    for (const item of dto.enrollments) {
      const dup = await this.repository.findDuplicate(
        item.studentId,
        item.semesterId,
      );
      if (dup) {
        skipped.push(item.studentId);
        continue;
      }

      const softDeleted = await this.repository.findSoftDeleted(
        item.studentId,
        item.semesterId,
      );
      if (softDeleted) {
        await this.repository.restore(softDeleted.id, {
          classroomId: item.classroomId,
        });
        restored.push(item.studentId);
      } else {
        toCreate.push(item);
      }
    }

    const created =
      toCreate.length > 0
        ? await this.repository.createMany(toCreate)
        : { count: 0 };

    return {
      created: created.count + restored.length,
      skipped: skipped.length,
      errors: skipped.map(
        (sid) => `Student ${sid} is already enrolled in this semester`,
      ),
    };
  }
}
