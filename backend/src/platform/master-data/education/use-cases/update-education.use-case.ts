import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateEducationDto } from '../dto/request/update-education.dto.js';
import { IEducationRepository } from '../domain/interfaces/education-repository.interface.js';

@Injectable()
export class UpdateEducationUseCase {
  private readonly logger = new Logger(UpdateEducationUseCase.name);

  constructor(private readonly educationRepository: IEducationRepository) {}

  async execute(id: string, dto: UpdateEducationDto) {
    const current = await this.educationRepository.findById(id);
    if (!current)
      throw new NotFoundException(`Education with ID ${id} not found`);

    if (dto.name) {
      const duplicate = await this.educationRepository.findByName(dto.name, id);
      if (duplicate) {
        throw new ConflictException(
          `Education with name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.educationRepository.update(id, dto);
    this.logger.log(`Education updated: ${id}`);
    return updated;
  }
}
