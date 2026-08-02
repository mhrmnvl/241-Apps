import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../domain/interfaces/permission-repository.interface.js';

@Injectable()
export class GetPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute() {
    return this.permissionRepository.findAll();
  }
}
