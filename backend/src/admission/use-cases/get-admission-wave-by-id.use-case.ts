import { Injectable, NotFoundException } from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';

@Injectable()
export class GetAdmissionWaveByIdUseCase {
  constructor(
    private readonly admissionWaveRepository: IAdmissionWaveRepository,
  ) {}

  async execute(id: string) {
    const wave = await this.admissionWaveRepository.findById(id);
    if (!wave) {
      throw new NotFoundException('Gelombang tidak ditemukan');
    }
    return serializeWave(wave);
  }
}
