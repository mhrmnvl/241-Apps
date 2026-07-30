import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';

@Injectable()
export class GetRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(userId: string, isSuperAdmin = false) {
    return this.roleRepository.findAll(isSuperAdmin);
  }
}
