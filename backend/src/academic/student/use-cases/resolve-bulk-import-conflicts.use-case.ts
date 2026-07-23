import { Injectable, Logger } from '@nestjs/common';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { ClassroomRepository } from '../../classroom/index.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { UpdateStudentUseCase } from './update-student.use-case.js';
import { UpdateStudentProfileUseCase } from './update-student-profile.use-case.js';
import { CreateStudentUseCase } from './create-student.use-case.js';

@Injectable()
export class ResolveBulkImportConflictsUseCase {
  private readonly logger = new Logger(ResolveBulkImportConflictsUseCase.name);

  constructor(
    private readonly gradeRepo: IGradeRepository,
    private readonly classroomRepo: ClassroomRepository,
    private readonly updateStudent: UpdateStudentUseCase,
    private readonly updateStudentProfile: UpdateStudentProfileUseCase,
    private readonly createStudent: CreateStudentUseCase,
  ) {}

  async execute(
    dto: ResolveBulkImportConflictsDto,
  ): Promise<ResolveBulkImportResponseDto> {
    let updated = 0;
    let skipped = 0;
    const errors: { existingId: string; error: string }[] = [];

    for (const item of dto.conflicts) {
      if (item.action === 'skip') {
        skipped++;
        continue;
      }

      try {
        let gradeId: string | undefined;
        if (item.data.grade) {
          const grade = await this.gradeRepo.findByLevel(item.data.grade);
          gradeId = grade?.id;
        }

        if (!item.existingId) {
          let classroomId: string | undefined;
          if (item.data.classroomCode) {
            const classroom = await this.classroomRepo.findByCode(
              item.data.classroomCode,
            );
            classroomId = classroom?.id;
          }

          await this.createStudent.execute({
            identifier: item.data.identifier,
            password: item.data.password,
            name: item.data.name,
            nik: item.data.nik,
            gender: item.data.gender,
            birthPlace: item.data.birthPlace,
            birthDate: item.data.birthDate,
            email: item.data.email,
            phone: item.data.phone,
            gradeId,
            classroomId,
            nis: item.data.nis,
            nisn: item.data.nisn,
          });
          updated++;
        } else {
          await this.updateStudent.execute(item.existingId, {
            nis: item.data.nis,
            nisn: item.data.nisn,
            ...(gradeId && { gradeId }),
          });
          await this.updateStudentProfile.execute(item.existingId, {
            name: item.data.name,
            nik: item.data.nik,
            gender: item.data.gender,
            birthPlace: item.data.birthPlace,
            birthDate: item.data.birthDate,
            email: item.data.email,
            phone: item.data.phone,
          });
          updated++;
        }
      } catch (err) {
        skipped++;
        const message = err instanceof Error ? err.message : 'Unexpected error';
        errors.push({
          existingId: item.existingId || 'NEW_ROW',
          error: message,
        });
        this.logger.warn(
          `Failed to resolve conflict/creation for student ${item.existingId || 'new'}: ${message}`,
        );
      }
    }

    return { total: dto.conflicts.length, updated, skipped, errors };
  }
}
