import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../domain/interfaces/role-repository.interface.js';
import { IUserRepository } from '../../../user/index.js';

@Injectable()
export class AssignRoleToUserUseCase {
  private readonly logger = new Logger(AssignRoleToUserUseCase.name);

  constructor(
    private readonly rolesRepo: IRoleRepository,
    private readonly usersRepo: IUserRepository,
  ) {}

  async execute(roleId: string, userId: string, requesterUserId?: string) {
    let isSuperAdmin = true;
    if (requesterUserId) {
      const userRoles = await this.rolesRepo.findUserRoles(requesterUserId);
      isSuperAdmin = userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');
    }

    const role = await this.rolesRepo.findById(roleId, isSuperAdmin);
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const existingRelation = await this.rolesRepo.findUserRole(userId, roleId);
    if (existingRelation) {
      throw new ConflictException('User already has this role');
    }

    await this.rolesRepo.assignRoleToUser(userId, roleId);
    this.logger.log(`Role ${role.code} assigned to user ${userId}`);
  }
}
