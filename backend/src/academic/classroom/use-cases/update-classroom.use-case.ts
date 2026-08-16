import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateClassroomDto } from '../dto/request/update-classroom.dto.js';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { withDisplayName } from '../../../shared/utils/classroom-display-name.helper.js';

@Injectable()
export class UpdateClassroomUseCase {
  private readonly logger = new Logger(UpdateClassroomUseCase.name);

  constructor(private readonly classroomRepository: IClassroomRepository) {}

  async execute(id: string, dto: UpdateClassroomDto) {
    const current = await this.classroomRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }

    /**
     * A classroom belongs to one academic year and one grade level, and its
     * enrolments and teaching assignments are filed under it. Re-pointing a
     * classroom that already holds them carries a whole class into another year
     * — or another grade — without a single row of theirs changing, which is
     * exactly what makes it invisible afterwards.
     *
     * A new year gets new classrooms; rollover copies them within a year and
     * promotion creates them across years (ADR-0004). Neither moves one.
     *
     * The code, name, capacity and active flag stay editable. Only the two that
     * decide whose class this is are locked once there is a class in it.
     */
    const movingYear =
      dto.academicYearId !== undefined &&
      dto.academicYearId !== current.academicYearId;
    const movingGrade =
      dto.gradeId !== undefined && dto.gradeId !== current.gradeId;

    if (movingYear || movingGrade) {
      const [enrollments, assignments] = await Promise.all([
        this.classroomRepository.countEnrollments(id),
        this.classroomRepository.countTeachingAssignments(id),
      ]);

      if (enrollments > 0 || assignments > 0) {
        throw new ConflictException(
          `This classroom already has ${enrollments} enrolment(s) and ` +
            `${assignments} teaching assignment(s), so its academic year and ` +
            'grade can no longer be changed. Create a classroom in the target ' +
            'academic year instead.',
        );
      }
    }

    const academicYearId = dto.academicYearId ?? current.academicYearId;
    const code = dto.code ?? current.code;

    const hasChanged =
      academicYearId !== current.academicYearId || code !== current.code;

    if (hasChanged) {
      const duplicate = await this.classroomRepository.findDuplicate(
        code,
        academicYearId,
        id,
      );
      if (duplicate) {
        throw new ConflictException(
          `Classroom code "${code}" already exists for this configuration`,
        );
      }
    }

    const updated = await this.classroomRepository.update(id, {
      academicYearId: dto.academicYearId,
      gradeId: dto.gradeId,
      code: dto.code,
      name: dto.name,
      capacity: dto.capacity,
      isActive: dto.isActive,
    });
    this.logger.log(`Class updated: ${id}`);
    return withDisplayName(updated);
  }
}
