import { Injectable, Logger } from '@nestjs/common';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { IClassroomRepository } from '../../classroom/index.js';
import { ResolveBulkImportConflictsDto } from '../dto/request/resolve-bulk-import-conflicts.dto.js';
import { ResolveBulkImportResponseDto } from '../dto/response/resolve-bulk-import-response.dto.js';
import { UpdateStudentUseCase } from './update-student.use-case.js';
import { UpdateStudentProfileUseCase } from './update-student-profile.use-case.js';
import { CreateStudentUseCase } from './create-student.use-case.js';
import { EnsureStudentEnrollmentUseCase } from '../../enrollment/use-cases/ensure-student-enrollment.use-case.js';
import { resolveOnceByKey } from '../../../shared/utils/resolve-once-by-key.helper.js';
import { processBulkImportConflicts } from '../../../shared/utils/process-bulk-import-conflicts.helper.js';

@Injectable()
export class ResolveBulkImportConflictsUseCase {
  private readonly logger = new Logger(ResolveBulkImportConflictsUseCase.name);

  constructor(
    private readonly gradeRepository: IGradeRepository,
    private readonly classroomRepository: IClassroomRepository,
    private readonly updateStudent: UpdateStudentUseCase,
    private readonly updateStudentProfile: UpdateStudentProfileUseCase,
    private readonly createStudent: CreateStudentUseCase,
    private readonly ensureStudentEnrollment: EnsureStudentEnrollmentUseCase,
  ) {}

  async execute(
    dto: ResolveBulkImportConflictsDto,
  ): Promise<ResolveBulkImportResponseDto> {
    const [gradeByLevel, classroomByCode] = await Promise.all([
      resolveOnceByKey(
        dto.conflicts.map((item) => item.data.grade),
        (level) => this.gradeRepository.findByLevel(level),
      ),
      resolveOnceByKey(
        dto.conflicts.map((item) => item.data.classroomCode),
        (code) => this.classroomRepository.findByCode(code),
      ),
    ]);

    return processBulkImportConflicts(
      dto.conflicts,
      'student',
      this.logger,
      async (item) => {
        const gradeId = item.data.grade
          ? gradeByLevel.get(item.data.grade)?.id
          : undefined;
        const classroomId = item.data.classroomCode
          ? classroomByCode.get(item.data.classroomCode)?.id
          : undefined;

        if (!item.existingId) {
          // classroomId is passed through; CreateStudentUseCase itself calls
          // EnsureStudentEnrollmentUseCase when it's set.
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
          if (classroomId) {
            await this.ensureStudentEnrollment.execute(
              item.existingId,
              classroomId,
            );
          }
        }
      },
    );
  }
}
