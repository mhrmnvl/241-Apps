import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTeacherDto } from '../dto/request/update-teacher.dto.js';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';

@Injectable()
export class UpdateTeacherUseCase {
  private readonly logger = new Logger(UpdateTeacherUseCase.name);

  constructor(private readonly teacherRepository: ITeacherRepository) {}

  async execute(id: string, dto: UpdateTeacherDto) {
    const current = await this.teacherRepository.findById(id);
    if (!current)
      throw new NotFoundException(`Teacher with ID ${id} not found`);

    if (dto.nip) {
      const existing = await this.teacherRepository.findByNip(dto.nip, id);
      if (existing)
        throw new ConflictException(`NIP "${dto.nip}" is already registered`);
    }

    if (dto.nuptk) {
      const existing = await this.teacherRepository.findByNuptk(dto.nuptk, id);
      if (existing)
        throw new ConflictException(
          `NUPTK "${dto.nuptk}" is already registered`,
        );
    }

    const updated = await this.teacherRepository.update(id, dto);
    this.logger.log(`Teacher updated: ${id}`);
    return updated;
  }
}
