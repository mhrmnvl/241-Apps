import { Injectable, Logger } from '@nestjs/common';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
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
    private readonly teacherRepository: ITeacherRepository,
    private readonly updateTeacher: UpdateTeacherUseCase,
    private readonly updateTeacherProfile: UpdateTeacherProfileUseCase,
    private readonly createTeacher: CreateTeacherUseCase,
  ) {}

  async execute(
    dto: ResolveBulkImportConflictsDto,
  ): Promise<ResolveBulkImportResponseDto> {
    const employmentTypeIdByCode = await resolveOnceByKey(
      dto.conflicts.map((item) => item.data.employmentTypeCode),
      (code) => this.teacherRepository.resolveEmploymentTypeId(code),
    );

    return processBulkImportConflicts(
      dto.conflicts,
      'teacher',
      this.logger,
      async (item) => {
        const employmentTypeId = employmentTypeIdByCode.get(
          item.data.employmentTypeCode,
        )!;

        // A decision can arrive without an `existingId` for two reasons: the
        // row is genuinely new, or it duplicates an earlier row of the same
        // file, which this run created a moment ago. Only a lookup made *now*
        // can tell those apart, so make one rather than trusting the preview —
        // it also closes the gap where somebody else created the record
        // between the preview and this call.
        const existingId = item.existingId ?? (await this.resolveId(item.data));

        if (!existingId) {
          const createDto: CreateTeacherDto = {
            ...item.data,
            employmentTypeId,
          };
          await this.createTeacher.execute(createDto);
        } else {
          await this.updateTeacher.execute(existingId, {
            nip: item.data.nip,
            nuptk: item.data.nuptk,
            employmentTypeId,
          });
          await this.updateTeacherProfile.execute(existingId, {
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

  /**
   * Finds the teacher a row refers to, in the same order the preview uses:
   * NIP, then NUPTK, then the profile's NIK. Returns undefined when the row
   * matches nobody, which means it is genuinely new.
   */
  private async resolveId(data: {
    nip?: string;
    nuptk?: string;
    nik?: string;
  }): Promise<string | undefined> {
    if (data.nip) {
      const byNip = await this.teacherRepository.findByNip(data.nip);
      if (byNip) return byNip.id;
    }
    if (data.nuptk) {
      const byNuptk = await this.teacherRepository.findByNuptk(data.nuptk);
      if (byNuptk) return byNuptk.id;
    }
    if (data.nik) {
      const profile = await this.teacherRepository.findProfileByNik(data.nik);
      if (profile) {
        const teacher = await this.teacherRepository.findByUserId(
          profile.userId,
        );
        if (teacher) return teacher.id;
      }
    }
    return undefined;
  }
}
