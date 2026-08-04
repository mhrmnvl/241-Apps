import { Injectable, Logger } from '@nestjs/common';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentResponseDto } from '../dto/response/student-response.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { EnsureStudentEnrollmentUseCase } from '../../enrollment/use-cases/ensure-student-enrollment.use-case.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';
import {
  StudentCreationFailedException,
  StudentNisAlreadyExistsException,
  StudentNisnAlreadyExistsException,
} from '../domain/exceptions/index.js';

@Injectable()
export class CreateStudentUseCase {
  private readonly logger = new Logger(CreateStudentUseCase.name);

  constructor(
    private readonly studentRepository: IStudentRepository,
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
      nis ? this.studentRepository.findByNis(nis) : null,
      nisn ? this.studentRepository.findByNisn(nisn) : null,
    ]);
    if (dupNis) throw new StudentNisAlreadyExistsException(nis);
    if (dupNisn) throw new StudentNisnAlreadyExistsException(nisn);

    const passwordHash = await hashPassword(dto.password);

    const userWithStudent = await this.studentRepository.create(
      { ...dto, birthDate: new Date(dto.birthDate) },
      passwordHash,
    );
    const student = userWithStudent.student;
    if (!student) {
      throw new StudentCreationFailedException();
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
