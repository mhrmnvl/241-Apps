import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateStudentWithRelationsDto } from '../dto/request/create-student-with-relations.dto.js';
import { StudentRepository } from '../repositories/student.repository.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateStudentWithRelationsUseCase {
  private readonly logger = new Logger(CreateStudentWithRelationsUseCase.name);

  constructor(private readonly repository: StudentRepository) {}

  async execute(
    dto: CreateStudentWithRelationsDto,
  ): Promise<StudentWithDetails> {
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
    const student = await this.repository.createWithRelations(
      dto,
      passwordHash,
    );

    this.logger.log(`Student created with relations: ${nis || dto.identifier}`);
    return student;
  }
}
