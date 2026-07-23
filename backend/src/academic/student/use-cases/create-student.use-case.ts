import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateStudentDto } from '../dto/request/create-student.dto.js';
import { StudentResponseDto } from '../dto/response/student-response.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { StudentCreatedEvent } from '../domain/events/student.events.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateStudentUseCase {
  private readonly logger = new Logger(CreateStudentUseCase.name);

  constructor(
    private readonly repo: StudentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateStudentDto): Promise<StudentResponseDto> {
    const nis = dto.nis ?? '';
    const nisn = dto.nisn ?? '';
    dto.nis = nis;
    dto.nisn = nisn;

    dto.identifier ??= nis ? nis : dto.name.toLowerCase().replace(/\s+/g, '.');
    dto.password ??= nis ? nis : dto.identifier;

    const [dupNis, dupNisn] = await Promise.all([
      nis ? this.repo.findByNis(nis) : null,
      nisn ? this.repo.findByNisn(nisn) : null,
    ]);
    if (dupNis)
      throw new ConflictException(`NIS "${nis}" is already registered`);
    if (dupNisn)
      throw new ConflictException(`NISN "${nisn}" is already registered`);

    const passwordHash = await hashPassword(dto.password);

    const userWithStudent = await this.repo.create(dto, passwordHash);
    const student = userWithStudent.student;
    if (!student) {
      throw new Error('Student creation failed');
    }

    if (dto.classroomId) {
      this.eventEmitter.emit(
        'student.created',
        new StudentCreatedEvent(student.id, dto.classroomId),
      );
      this.logger.log(
        `Dispatched student.created event for student ${nis || dto.identifier} with classroomId ${dto.classroomId}`,
      );
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
