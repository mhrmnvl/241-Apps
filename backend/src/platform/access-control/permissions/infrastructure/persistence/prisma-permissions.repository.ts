import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { IPermissionsRepository } from '../../domain/interfaces/permissions-repository.interface.js';

@Injectable()
export class PrismaPermissionsRepository extends IPermissionsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return this.prisma.permission.findUnique({
      where: { code },
    });
  }

  async findUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async findUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.findUserRoles(userId);

    const isSuperAdmin = userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      const allPermissions = await this.prisma.permission.findMany({
        select: { code: true },
      });
      return allPermissions.map((p) => p.code);
    }

    const permissionCodes: string[] = [];
    for (const ur of userRoles) {
      const rp = await this.prisma.rolePermission.findMany({
        where: { roleId: ur.roleId },
        include: { permission: true },
      });
      for (const item of rp) {
        if (!permissionCodes.includes(item.permission.code)) {
          permissionCodes.push(item.permission.code);
        }
      }
    }
    return permissionCodes;
  }

  async findRolePermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async upsertPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }) {
    return this.prisma.permission.upsert({
      where: { code: data.code },
      update: {
        module: data.module,
        action: data.action,
        description: data.description,
      },
      create: data,
    });
  }

  async createPermission(data: {
    module: string;
    action: string;
    code: string;
    description: string;
  }) {
    return this.prisma.permission.create({ data });
  }

  async updatePermission(id: string, data: { description: string }) {
    return this.prisma.permission.update({ where: { id }, data });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
