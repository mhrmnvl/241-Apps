import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentResponseDto } from '../dto/response/student-response.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { EnsureStudentEnrollmentUseCase } from '../../enrollment/use-cases/ensure-student-enrollment.use-case.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateStudentUseCase {
  private readonly logger = new Logger(CreateStudentUseCase.name);

  constructor(
    private readonly repository: StudentRepository,
    private readonly ensureStudentEnrollment: EnsureStudentEnrollmentUseCase,
  ) {}

  async execute(dto: CreateStudentDto): Promise<StudentResponseDto> {
    const nis = dto.nis ?? '';
    const nisn = dto.nisn ?? '';
    dto.nis = nis;
    dto.nisn = nisn;

    dto.identifier ??= nis ? nis : dto.name.toLowerCase().replace(/\s+/g, '.');
    dto.password ??= nis ? nis : dto.identifier;

    const [dupNis, dupNisn] = await Promise.all([
      nis ? this.repository.findByNis(nis) : null,
      nisn ? this.repository.findByNisn(nisn) : null,
    ]);
    if (dupNis)
      throw new ConflictException(`NIS "${nis}" is already registered`);
    if (dupNisn)
      throw new ConflictException(`NISN "${nisn}" is already registered`);

    const passwordHash = await hashPassword(dto.password);

    const userWithStudent = await this.repository.create(dto, passwordHash);
    const student = userWithStudent.student;
    if (!student) {
      throw new Error('Student creation failed');
    }

    if (dto.classroomId) {
      await this.ensureStudentEnrollment.execute(student.id, dto.classroomId);
    }

    this.logger.log(`Student created: ${nis || dto.identifier}`);
    return {
      id: student.id,
      userId: student.userId,
      nis: student.nis,
      nisn: student.nisn,
      status: student.status,
      gradeId: student.gradeId ?? undefined,
    };
  }
}
