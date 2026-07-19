import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { IRoleRepository } from '../../domain/interfaces/role-repository.interface.js';

@Injectable()
export class PrismaRoleRepository extends IRoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(isSuperAdmin = false) {
    return this.prisma.role.findMany({
      where: {
        ...(!isSuperAdmin && { code: { not: 'SUPER_ADMIN' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, isSuperAdmin = true) {
    return this.prisma.role.findFirst({
      where: {
        id,
        ...(!isSuperAdmin && { code: { not: 'SUPER_ADMIN' } }),
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.role.findFirst({ where: { code } });
  }

  async create(data: { name: string; code: string; description?: string }) {
    return this.prisma.role.create({
      data: { ...data, isSystem: false },
    });
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return this.prisma.role.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({ data: { userId, roleId } });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    return this.prisma.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async findUserRole(userId: string, roleId: string) {
    return this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
  }

  async findUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }
}
