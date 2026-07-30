import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';

@Injectable()
export class DeleteTimeSlotTypeUseCase {
  constructor(private readonly repository: ITimeSlotRepository) {}

  async execute(id: string) {
    const type = await this.repository.findTypeById(id);
    if (!type) {
      throw new NotFoundException('Tipe jam tidak ditemukan');
    }
    const inUse = await this.repository.countSlotsUsingType(id);
    if (inUse > 0) {
      throw new ConflictException(
        'Tipe masih dipakai oleh jam pelajaran, tidak bisa dihapus',
      );
    }
    return this.repository.removeType(id);
  }
}
