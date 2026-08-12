import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';

@Injectable()
export class DeleteStatusUseCase {
  constructor(private readonly statusRepository: IStatusRepository) {}

  async execute(id: string) {
    const status = await this.statusRepository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    if (status.systemKey) {
      throw new BadRequestException(
        `Status "${status.name}" fills the "${status.systemKey}" role in the loan workflow and cannot be deleted. Release its system role first.`,
      );
    }
    return this.statusRepository.delete(id);
  }
}
