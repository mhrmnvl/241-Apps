import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { serializeWave } from '../domain/admission.serializers.js';
import { IAdmissionWaveRepository } from '../domain/interfaces/admission-wave-repository.interface.js';
import { CreateAdmissionWaveDto } from '../dto/request/create-admission-wave.dto.js';

@Injectable()
export class CreateAdmissionWaveUseCase {
  constructor(
    private readonly admissionWaveRepository: IAdmissionWaveRepository,
  ) {}

  async execute(dto: CreateAdmissionWaveDto) {
    const existing = await this.admissionWaveRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Admission wave code '${dto.code}' is already in use`,
      );
    }

    // A wave whose end precedes its start is never open, so registration is
    // shut with nothing saying why. The same check guards a semester; it was
    // missing here.
    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const created = await this.admissionWaveRepository.create({
      name: dto.name,
      code: dto.code,
      academicYearId: dto.academicYearId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      quota: dto.quota,
      registrationFee: dto.registrationFee,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    return serializeWave(created);
  }
}
