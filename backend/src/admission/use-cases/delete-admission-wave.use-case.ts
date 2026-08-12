import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';

@Injectable()
export class DeleteAdmissionWaveUseCase {
  constructor(
    private readonly admissionWaveRepository: IAdmissionWaveRepository,
  ) {}

  async execute(id: string) {
    const wave = await this.admissionWaveRepository.findById(id);
    if (!wave) {
      throw new NotFoundException('Admission wave not found');
    }
    if ((wave._count?.applications ?? 0) > 0) {
      throw new ConflictException(
        'An admission wave with applicants cannot be deleted. Deactivate it instead.',
      );
    }

    return this.admissionWaveRepository.softDelete(id);
  }
}
