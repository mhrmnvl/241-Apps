import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { ITeacherAddressRepository } from '../domain/interfaces/teacher-address-repository.interface.js';
import { ITeacherRepository } from '../index.js';

@Injectable()
export class TeacherAddressUseCase {
  private readonly logger = new Logger(TeacherAddressUseCase.name);

  constructor(
    private readonly teacherRepository: ITeacherRepository,
    private readonly addressRepository: ITeacherAddressRepository,
  ) {}

  async findAll(teacherId: string) {
    await this.ensureExists(teacherId);
    return this.addressRepository.findByTeacherId(teacherId);
  }

  async add(teacherId: string, dto: CreateAddressDto) {
    await this.ensureExists(teacherId);
    const address = await this.addressRepository.create(teacherId, {
      street: dto.street,
      rt: dto.rt,
      rw: dto.rw,
      village: dto.village,
      district: dto.district,
      city: dto.city,
      province: dto.province,
      country: dto.country,
      postalCode: dto.postalCode,
      isPrimary: dto.isPrimary,
    });
    this.logger.log(`Address added to teacher ${teacherId}`);
    return address;
  }

  async update(teacherId: string, addressId: string, dto: UpdateAddressDto) {
    await this.ensureExists(teacherId);
    await this.ensureAddressExists(teacherId, addressId);
    const updated = await this.addressRepository.update(
      teacherId,
      addressId,
      dto,
    );
    this.logger.log(`Address ${addressId} updated for teacher ${teacherId}`);
    return updated;
  }

  async remove(teacherId: string, addressId: string): Promise<void> {
    await this.ensureExists(teacherId);
    await this.ensureAddressExists(teacherId, addressId);
    await this.addressRepository.softDelete(teacherId, addressId);
    this.logger.log(`Address ${addressId} removed from teacher ${teacherId}`);
  }

  private async ensureExists(id: string) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    return teacher;
  }

  private async ensureAddressExists(teacherId: string, addressId: string) {
    const address = await this.addressRepository.findById(teacherId, addressId);
    if (!address)
      throw new NotFoundException(
        `Address with ID ${addressId} not found for this teacher`,
      );
    return address;
  }
}
