import { Injectable } from '@nestjs/common';
import { IPermissionRepository } from '../domain/interfaces/permission-repository.interface.js';
import { appForModule } from '../constants/permission-apps.constants.js';

@Injectable()
export class GetPermissionsUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  /**
   * Each permission is returned with the application it belongs to, so the role
   * screen can group by it.
   *
   * Computed here rather than stored, because it is a fact about the code
   * rather than about the row — which application owns a module changes when
   * the code moves, not when a database is edited. It is also not derivable
   * from the code's name: four presence modules carry no `presence-` prefix,
   * and grouping by prefix would file the leave system under academic.
   */
  async execute() {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map((permission) => ({
      ...permission,
      app: appForModule(permission.module),
    }));
  }
}
