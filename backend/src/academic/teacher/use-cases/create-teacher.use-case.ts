import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateTeacherDto } from '../dto/request/create-teacher.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { hashPassword } from '../../../shared/utils/hash.helper.js';

@Injectable()
export class CreateTeacherUseCase {
  private readonly logger = new Logger(CreateTeacherUseCase.name);

  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(dto: CreateTeacherDto) {
    const fallback = dto.nip ?? dto.nuptk ?? dto.nik;
    dto.identifier ??= fallback;
    dto.password ??= fallback;

    const [existingUsername, existingNik, existingNip, existingNuptk] =
      await Promise.all([
        this.teacherRepository.findUserByIdentifier(dto.identifier),
        this.teacherRepository.findProfileByNik(dto.nik),
        dto.nip ? this.teacherRepository.findByNip(dto.nip) : null,
        dto.nuptk ? this.teacherRepository.findByNuptk(dto.nuptk) : null,
      ]);

    if (existingUsername)
      throw new ConflictException(
        `Identifier "${dto.identifier}" is already taken`,
      );
    if (existingNik)
      throw new ConflictException(`NIK "${dto.nik}" is already registered`);
    if (existingNip)
      throw new ConflictException(`NIP "${dto.nip}" is already registered`);
    if (existingNuptk)
      throw new ConflictException(`NUPTK "${dto.nuptk}" is already registered`);

    const hashedPassword = await hashPassword(dto.password);
    const teacher = await this.teacherRepository.create(
      { ...dto, birthDate: new Date(dto.birthDate) },
      hashedPassword,
    );

    this.logger.log(`Teacher created: ${dto.name}`);
    return teacher;
  }
}
