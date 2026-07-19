import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { TeacherAddressRepository } from '../repositories/teacher-address.repository.js';
import { TeacherRepository } from '../index.js';

@Injectable()
export class TeacherAddressUseCase {
  private readonly logger = new Logger(TeacherAddressUseCase.name);

  constructor(
    private readonly repo: TeacherRepository,
    private readonly addressRepo: TeacherAddressRepository,
  ) {}

  async findAll(teacherId: string) {
    await this.ensureExists(teacherId);
    return this.addressRepo.findAll(teacherId);
  }

  async add(teacherId: string, dto: CreateAddressDto) {
    await this.ensureExists(teacherId);
    const address = await this.addressRepo.create(teacherId, dto);
    this.logger.log(`Address added to teacher ${teacherId}`);
    return address;
  }

  async update(teacherId: string, addressId: string, dto: UpdateAddressDto) {
    await this.ensureExists(teacherId);
    await this.ensureAddressExists(teacherId, addressId);
    const updated = await this.addressRepo.update(teacherId, addressId, dto);
    this.logger.log(`Address ${addressId} updated for teacher ${teacherId}`);
    return updated;
  }

  async remove(teacherId: string, addressId: string): Promise<void> {
    await this.ensureExists(teacherId);
    await this.ensureAddressExists(teacherId, addressId);
    await this.addressRepo.remove(addressId);
    this.logger.log(`Address ${addressId} removed from teacher ${teacherId}`);
  }

  private async ensureExists(id: string) {
    const teacher = await this.repo.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }

  private async ensureAddressExists(teacherId: string, addressId: string) {
    const address = await this.addressRepo.findById(teacherId, addressId);
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this teacher`,
      );
    return address;
  }
}
