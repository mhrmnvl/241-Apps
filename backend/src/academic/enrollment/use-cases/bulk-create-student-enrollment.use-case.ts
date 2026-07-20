import { Injectable } from '@nestjs/common';
import { BulkCreateStudentEnrollmentDto } from '../dto/request/bulk-create-student-enrollment.dto.js';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class BulkCreateStudentEnrollmentUseCase {
  constructor(private readonly repo: IEnrollmentRepository) {}
  async execute(dto: BulkCreateStudentEnrollmentDto) {
    const toCreate: CreateStudentEnrollmentDto[] = [];
    const skipped: string[] = [];
    const restored: string[] = [];

    for (const item of dto.enrollments) {
      const dup = await this.repo.findDuplicate(
        item.studentId,
        item.semesterId,
      );
      if (dup) {
        skipped.push(item.studentId);
        continue;
      }

      const softDeleted = await this.repo.findSoftDeleted(
        item.studentId,
        item.semesterId,
      );
      if (softDeleted) {
        await this.repo.restore(softDeleted.id, {
          classroomId: item.classroomId,
        });
        restored.push(item.studentId);
      } else {
        toCreate.push(item);
      }
    }

    const created =
      toCreate.length > 0 ? await this.repo.createMany(toCreate) : [];

    return {
      created: created.length + restored.length,
      skipped: skipped.length,
      errors: skipped.map(
        (sid) => `Student ${sid} is already enrolled in this semester`,
      ),
    };
  }
}
