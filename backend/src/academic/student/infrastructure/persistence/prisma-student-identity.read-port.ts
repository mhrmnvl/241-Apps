import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IStudentIdentityReadPort } from '../../domain/interfaces/student-identity-read.port.js';

@Injectable()
export class PrismaStudentIdentityReadPort extends IStudentIdentityReadPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * `deletedAt: null` matters more here than in most reads: a soft-deleted
   * student must resolve to null, so their account stops answering as them
   * rather than continuing to reach the record from the other side.
   */
  async findStudentIdByUserId(userId: string): Promise<string | null> {
    const student = await this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    return student?.id ?? null;
  }
}
