import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ITeacherIdentityReadPort } from '../../domain/interfaces/teacher-identity-read.port.js';

@Injectable()
export class PrismaTeacherIdentityReadPort extends ITeacherIdentityReadPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findTeacherIdByUserId(userId: string): Promise<string | null> {
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    return teacher?.id ?? null;
  }
}
