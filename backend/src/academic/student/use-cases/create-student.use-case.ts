import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateStudentDto } from '../dto/create-student.dto.js';
import { StudentResponseDto } from '../dto/student-response.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { StudentCreatedEvent } from '../domain/events/student.events.js';

@Injectable()
export class CreateStudentUseCase {
  private readonly logger = new Logger(CreateStudentUseCase.name);

  constructor(
    private readonly repo: StudentRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateStudentDto): Promise<StudentResponseDto> {
    dto.identifier ??= dto.nis;
    dto.password ??= dto.nis;

    const [dupNis, dupNisn] = await Promise.all([
      this.repo.findByNis(dto.nis),
      this.repo.findByNisn(dto.nisn),
    ]);
    if (dupNis)
      throw new ConflictException(`NIS "${dto.nis}" is already registered`);
    if (dupNisn)
      throw new ConflictException(`NISN "${dto.nisn}" is already registered`);

    const passwordHash = await bcrypt.hash(dto.password, 10);

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
        `Dispatched student.created event for student ${dto.nis} with classroomId ${dto.classroomId}`,
      );
    }

    this.logger.log(`Student created: ${dto.nis}`);
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
