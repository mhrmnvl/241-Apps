import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStatusRepository } from '../domain/interfaces/status-repository.interface.js';

@Injectable()
export class DeleteStatusUseCase {
  constructor(private readonly repository: IStatusRepository) {}

  async execute(id: string) {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }
    if (status.systemKey) {
      throw new BadRequestException(
        `Status "${status.name}" berperan sebagai "${status.systemKey}" dalam alur pinjam-meminjam dan tidak dapat dihapus. Lepaskan peran sistemnya terlebih dahulu.`,
      );
    }
    return this.repository.delete(id);
  }
}
