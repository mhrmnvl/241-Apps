import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';
import { isStructuralRole } from '../constants/structural-roles.constants.js';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    // Two conditions, not one. `isSystem` is data, and data can be created
    // wrong — which it was: the seed marked TEACHER and STUDENT deletable while
    // the code resolved both by name. The second condition asks the code
    // instead, so a row whose flag is missing for any reason is still refused.
    if (role.isSystem || isStructuralRole(role.code)) {
      throw new ForbiddenException(
        `The ${role.code} role cannot be deleted: the application resolves it by name and stops working without it.`,
      );
    }

    return this.roleRepository.delete(id);
  }
}
