import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateEmploymentTypeDto } from '../dto/request/create-employment-type.dto.js';
import { IEmploymentTypeRepository } from '../domain/interfaces/employment-type-repository.interface.js';

@Injectable()
export class CreateEmploymentTypeUseCase {
  private readonly logger = new Logger(CreateEmploymentTypeUseCase.name);

  constructor(
    private readonly employmentTypeRepository: IEmploymentTypeRepository,
  ) {}

  async execute(dto: CreateEmploymentTypeDto) {
    const existing = await this.employmentTypeRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Employment type code "${dto.code}" already exists for this school unit`,
      );
    }

    const type = await this.employmentTypeRepository.create({
      code: dto.code,
      name: dto.name,
    });
    this.logger.log(`Employment type created: ${type.code}`);
    return type;
  }
}
