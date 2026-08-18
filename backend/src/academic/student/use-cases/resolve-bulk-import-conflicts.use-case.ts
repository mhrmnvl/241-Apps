import { Injectable, Logger } from '@nestjs/common';
import { IGradeRepository } from '../../grade/domain/interfaces/grade-repository.interface.js';
import { IClassroomRepository } from '../../classroom/index.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
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
    private readonly studentRepository: IStudentRepository,
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

        // A decision can arrive without an `existingId` for two reasons: the
        // row is genuinely new, or it duplicates an earlier row of the same
        // file, which this run created a moment ago. Only a lookup made *now*
        // can tell those apart, so make one rather than trusting the preview —
        // it also closes the gap where somebody else created the record
        // between the preview and this call.
        const existingId =
          item.existingId ??
          (
            (item.data.nis
              ? await this.studentRepository.findByNis(item.data.nis)
              : null) ??
            (item.data.nisn
              ? await this.studentRepository.findByNisn(item.data.nisn)
              : null)
          )?.id;

        if (!existingId) {
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
          await this.updateStudent.execute(existingId, {
            nis: item.data.nis,
            nisn: item.data.nisn,
            ...(gradeId && { gradeId }),
          });
          await this.updateStudentProfile.execute(existingId, {
            name: item.data.name,
            nik: item.data.nik,
            gender: item.data.gender,
            birthPlace: item.data.birthPlace,
            birthDate: item.data.birthDate,
            email: item.data.email,
            phone: item.data.phone,
          });
          if (classroomId) {
            await this.ensureStudentEnrollment.execute(existingId, classroomId);
          }
        }
      },
    );
  }
}
