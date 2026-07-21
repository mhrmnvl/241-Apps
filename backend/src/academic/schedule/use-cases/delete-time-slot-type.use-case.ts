import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class DeleteTimeSlotTypeUseCase {
  constructor(private readonly repo: ITimeSlotRepository) {}

  async execute(id: string) {
    const type = await this.repo.findTypeById(id);
    if (!type) {
      throw new NotFoundException('Tipe jam tidak ditemukan');
    }
    const inUse = await this.repo.countSlotsUsingType(id);
    if (inUse > 0) {
      throw new ConflictException(
        'Tipe masih dipakai oleh jam pelajaran, tidak bisa dihapus',
      );
    }
    return this.repo.removeType(id);
  }
}
