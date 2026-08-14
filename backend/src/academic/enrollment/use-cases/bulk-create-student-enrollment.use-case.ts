import { Injectable } from '@nestjs/common';
import { BulkCreateStudentEnrollmentDto } from '../dto/request/bulk-create-student-enrollment.dto.js';
import { CreateStudentEnrollmentDto } from '../dto/request/create-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';
import { ClassroomCapacityService } from '../services/classroom-capacity.service.js';

@Injectable()
export class BulkCreateStudentEnrollmentUseCase {
  constructor(
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly classroomCapacity: ClassroomCapacityService,
  ) {}

  async execute(dto: BulkCreateStudentEnrollmentDto) {
    const toCreate: CreateStudentEnrollmentDto[] = [];
    const toRestore: { id: string; item: CreateStudentEnrollmentDto }[] = [];
    const skipped: string[] = [];

    // Classify everything before changing anything. This loop used to restore
    // soft-deleted rows as it went, which meant a batch that failed halfway
    // had already put some students back — and the capacity check below could
    // not have been honest about how many were arriving.
    for (const item of dto.enrollments) {
      const dup = await this.enrollmentRepository.findDuplicate(
        item.studentId,
        item.semesterId,
      );
      if (dup) {
        skipped.push(item.studentId);
        continue;
      }

      const softDeleted = await this.enrollmentRepository.findSoftDeleted(
        item.studentId,
        item.semesterId,
      );
      if (softDeleted) {
        toRestore.push({ id: softDeleted.id, item });
      } else {
        toCreate.push(item);
      }
    }

    // A batch may name more than one classroom, so each is asked separately.
    // Duplicates are already out, so what remains is genuinely arriving.
    const arriving = new Map<
      string,
      { count: number; item: { classroomId: string; semesterId: string } }
    >();
    for (const item of [...toCreate, ...toRestore.map((r) => r.item)]) {
      const key = `${item.classroomId}:${item.semesterId}`;
      const entry = arriving.get(key);
      if (entry) entry.count += 1;
      else arriving.set(key, { count: 1, item });
    }

    for (const { count, item } of arriving.values()) {
      await this.classroomCapacity.assertRoomFor({
        classroomId: item.classroomId,
        semesterId: item.semesterId,
        incoming: count,
      });
    }

    for (const { id, item } of toRestore) {
      await this.enrollmentRepository.restore(id, {
        classroomId: item.classroomId,
      });
    }

    const created =
      toCreate.length > 0
        ? await this.enrollmentRepository.createMany(toCreate)
        : { count: 0 };

    return {
      created: created.count + toRestore.length,
      skipped: skipped.length,
      errors: skipped.map(
        (sid) => `Student ${sid} is already enrolled in this semester`,
      ),
    };
  }
}
