import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';

@Injectable()
export class DeleteAdmissionWaveUseCase {
  constructor(private readonly repository: IAdmissionWaveRepository) {}

  async execute(id: string) {
    const wave = await this.repository.findById(id);
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    if (wave._count.applications > 0) {
      throw new ConflictException(
        'Gelombang dengan pendaftar tidak dapat dihapus. Nonaktifkan saja.',
      );
    }

    return this.repository.softDelete(id);
  }
}
