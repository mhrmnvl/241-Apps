import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';

@Injectable()
export class GetPermissionsUseCase {
  constructor(private readonly permissionsRepo: IPermissionRepository) {}

  async execute() {
    return this.permissionsRepo.findAll();
  }
}
