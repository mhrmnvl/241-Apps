import { Injectable, Logger } from '@nestjs/common';
import { IPermissionRepository } from '../interfaces/permission-repository.interface.js';
import { SYSTEM_PERMISSIONS } from '../constants/permission-codes.constants.js';

@Injectable()
export class SyncPermissionsUseCase {
  private readonly logger = new Logger(SyncPermissionsUseCase.name);

  constructor(private readonly permissionsRepo: IPermissionRepository) {}

  async execute(): Promise<void> {
    this.logger.log('Syncing system permissions with the database...');
    let count = 0;

    for (const permission of SYSTEM_PERMISSIONS) {
      await this.permissionsRepo.upsertPermission(permission);
      count++;
    }

    this.logger.log(`Successfully synced ${count} permissions.`);
  }
}
