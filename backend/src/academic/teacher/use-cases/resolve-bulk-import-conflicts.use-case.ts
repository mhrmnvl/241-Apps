import { Injectable, Logger } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { UpdateTeacherUseCase } from './update-teacher.use-case.js';
import { UpdateTeacherProfileUseCase } from './update-teacher-profile.use-case.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';

@Injectable()
export class ResolveBulkImportConflictsUseCase {
  private readonly logger = new Logger(ResolveBulkImportConflictsUseCase.name);

  constructor(
    private readonly repo: TeacherRepository,
    private readonly updateTeacher: UpdateTeacherUseCase,
    private readonly updateTeacherProfile: UpdateTeacherProfileUseCase,
    private readonly createTeacher: CreateTeacherUseCase,
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
        const employmentTypeId = await this.repo.resolveEmploymentTypeId(
          item.data.employmentTypeCode,
        );

        if (!item.existingId) {
          const createDto: CreateTeacherDto = {
            ...item.data,
            employmentTypeId,
          };
          await this.createTeacher.execute(createDto);
          updated++;
        } else {
          await this.updateTeacher.execute(item.existingId, {
            nip: item.data.nip,
            nuptk: item.data.nuptk,
            employmentTypeId,
          });
          await this.updateTeacherProfile.execute(item.existingId, {
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
          `Failed to resolve conflict/creation for teacher ${item.existingId || 'new'}: ${message}`,
        );
      }
    }

    return { total: dto.conflicts.length, updated, skipped, errors };
  }
}
