import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateOccupationDto } from '../dto/request/update-occupation.dto.js';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';

@Injectable()
export class UpdateOccupationUseCase {
  private readonly logger = new Logger(UpdateOccupationUseCase.name);

  constructor(private readonly repo: IOccupationRepository) {}

  async execute(id: string, dto: UpdateOccupationDto) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`Occupation with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.repo.findByName(dto.name, id);
      if (duplicate)
        throw new ConflictException(
          `Occupation name "${dto.name}" is already taken`,
        );
    }

    const occupation = await this.repo.update(id, dto);
    this.logger.log(`Occupation updated: ${id}`);
    return occupation;
  }
}
