import { Injectable, Logger } from '@nestjs/common';
import { CreateStudentWithRelationsDto } from '../dto/request/create-student-with-relations.dto.js';
import { IStudentRepository } from '../domain/interfaces/student-repository.interface.js';
import { StudentWithDetails } from '../domain/interfaces/student-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';
import {
  StudentNisAlreadyExistsException,
  StudentNisnAlreadyExistsException,
} from '../domain/exceptions/index.js';

@Injectable()
export class CreateStudentWithRelationsUseCase {
  private readonly logger = new Logger(CreateStudentWithRelationsUseCase.name);

  constructor(private readonly studentRepository: IStudentRepository) {}

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
      nis ? this.studentRepository.findByNis(nis) : null,
      nisn ? this.studentRepository.findByNisn(nisn) : null,
    ]);
    if (dupNis) throw new StudentNisAlreadyExistsException(nis);
    if (dupNisn) throw new StudentNisnAlreadyExistsException(nisn);

    const passwordHash = await hashPassword(dto.password);
    const student = await this.studentRepository.createWithRelations(
      {
        ...dto,
        birthDate: new Date(dto.birthDate),
        parents: dto.parents?.map((p) => ({
          ...p,
          birthDate: new Date(p.birthDate),
        })),
      },
      passwordHash,
    );

    this.logger.log(`Student created with relations: ${nis || dto.identifier}`);
    return student;
  }
}
