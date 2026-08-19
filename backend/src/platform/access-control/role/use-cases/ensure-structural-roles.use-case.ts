import { Injectable, Logger } from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';
import { STRUCTURAL_ROLES } from '../constants/structural-roles.constants.js';

/**
 * Makes sure the roles the code resolves by name exist, at boot.
 *
 * The same argument as the permission catalogue, which already syncs here: both
 * are part of the code's contract rather than data the school owns, and both
 * must reach a database nobody seeds. Production is populated through the UI,
 * and a missing role there is not an error — provisioning skipped it silently
 * and produced accounts with no role at all.
 *
 * It creates the role and nothing else. **No permissions are granted**, and
 * that is deliberate: which permissions a role carries is the school's decision,
 * made on the role screen. Granting a default set here would be seeding by
 * another name, and the school has said it does not want that.
 *
 * Existing roles are left alone apart from `isSystem`, which is raised where it
 * was false — a role the code cannot run without must not be deletable, and the
 * flag being wrong is the state this repository was actually in.
 */
@Injectable()
export class EnsureStructuralRolesUseCase {
  private readonly logger = new Logger(EnsureStructuralRolesUseCase.name);

  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<void> {
    const created: string[] = [];
    const protectedNow: string[] = [];

    for (const role of STRUCTURAL_ROLES) {
      const existing = await this.roleRepository.findByCode(role.code);

      if (!existing) {
        await this.roleRepository.createStructural({
          code: role.code,
          name: role.name,
          description: role.description,
        });
        created.push(role.code);
        continue;
      }

      if (!existing.isSystem) {
        await this.roleRepository.markSystem(existing.id);
        protectedNow.push(role.code);
      }
    }

    if (created.length > 0) {
      this.logger.log(
        `Created structural roles with no permissions — grant them on the role screen: ${created.join(', ')}`,
      );
    }
    if (protectedNow.length > 0) {
      this.logger.log(
        `Marked structural roles as protected: ${protectedNow.join(', ')}`,
      );
    }
  }
}
