import { Injectable } from '@nestjs/common';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface.js';

@Injectable()
export class GetPermissionsUseCase {
  constructor(private readonly permissionsRepo: IPermissionsRepository) {}

  async execute() {
    return this.permissionsRepo.findAll();
  }
}
