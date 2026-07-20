import { Injectable } from '@nestjs/common';
import { Prisma, User, UserGender } from '@prisma/client';

export interface ProvisionAccountProfileInput {
  name: string;
  nik: string;
  gender: UserGender;
  birthPlace: string;
  birthDate: Date;
  email?: string;
  phone?: string;
}

export interface ProvisionAccountInput {
  identifier: string;
  passwordHash: string;
  roleCode?: string;
  profile: ProvisionAccountProfileInput;
}

@Injectable()
export class AccountProvisioningService {
  async provision(
    tx: Prisma.TransactionClient,
    input: ProvisionAccountInput,
  ): Promise<User> {
    const user = await tx.user.create({
      data: {
        identifier: input.identifier,
        passwordHash: input.passwordHash,
        profile: { create: input.profile },
      },
    });

    if (input.roleCode) {
      const role = await tx.role.findUnique({
        where: { code: input.roleCode },
      });
      if (role) {
        await tx.userRole.create({
          data: { userId: user.id, roleId: role.id },
        });
      }
    }

    return user;
  }
}
