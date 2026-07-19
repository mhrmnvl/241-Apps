import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateParentDto } from '../dto/update-parent.dto.js';
import { ParentRepository } from '../repositories/parent.repository.js';

@Injectable()
export class UpdateParentUseCase {
  private readonly logger = new Logger(UpdateParentUseCase.name);

  constructor(private readonly repo: ParentRepository) {}

  async execute(id: string, dto: UpdateParentDto) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`Parent with ID ${id} not found`);

    if (dto.nik) {
      const dupNik = await this.repo.findByNik(dto.nik, id);
      if (dupNik)
        throw new ConflictException(`NIK "${dto.nik}" is already registered`);
    }

    if (dto.occupationId) {
      const occupation = await this.repo.findOccupationById(dto.occupationId);
      if (!occupation)
        throw new NotFoundException(
          `Occupation with ID ${dto.occupationId} not found`,
        );
      if (!occupation.isActive)
        throw new ConflictException(
          `Occupation "${occupation.name}" is inactive and cannot be assigned`,
        );
    }

    const parent = await this.repo.update(id, dto);
    this.logger.log(`Parent updated: ${id}`);
    return parent;
  }
}
