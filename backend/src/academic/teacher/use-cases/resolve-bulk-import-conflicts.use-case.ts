import { Injectable, Logger } from '@nestjs/common';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { UpdateTeacherUseCase } from './update-teacher.use-case.js';
import { UpdateTeacherProfileUseCase } from './update-teacher-profile.use-case.js';
import { CreateTeacherUseCase } from './create-teacher.use-case.js';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { resolveOnceByKey } from '../../../shared/utils/resolve-once-by-key.helper.js';
import { processBulkImportConflicts } from '../../../shared/utils/process-bulk-import-conflicts.helper.js';

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
    const employmentTypeIdByCode = await resolveOnceByKey(
      dto.conflicts.map((item) => item.data.employmentTypeCode),
      (code) => this.repo.resolveEmploymentTypeId(code),
    );

    return processBulkImportConflicts(
      dto.conflicts,
      'teacher',
      this.logger,
      async (item) => {
        const employmentTypeId = employmentTypeIdByCode.get(
          item.data.employmentTypeCode,
        )!;

        if (!item.existingId) {
          const createDto: CreateTeacherDto = {
            ...item.data,
            employmentTypeId,
          };
          await this.createTeacher.execute(createDto);
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
        }
      },
    );
  }
}
