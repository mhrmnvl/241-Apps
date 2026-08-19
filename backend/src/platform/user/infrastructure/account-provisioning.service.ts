import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  profile?: ProvisionAccountProfileInput;
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
        ...(input.profile && { profile: { create: input.profile } }),
      },
    });

    if (input.roleCode) {
      const role = await tx.role.findUnique({
        where: { code: input.roleCode },
      });

      // Refuses rather than skipping. This used to be `if (role)` with no else,
      // so a missing role produced an account with no role at all: the person
      // could sign in, hold no permission, see an empty application, and
      // nothing anywhere said why. Creating a teacher looked like it worked.
      //
      // It should now be unreachable — the roles the code resolves are ensured
      // at bootstrap — which is exactly what a backstop is for. If it ever
      // fires, the message names the role to create.
      if (!role) {
        throw new InternalServerErrorException(
          `The ${input.roleCode} role does not exist, so this account cannot be given one. ` +
            'It is created automatically when the application starts; if it is missing, restart the backend or add it on the role screen.',
        );
      }

      await tx.userRole.create({
        data: { userId: user.id, roleId: role.id },
      });
    }

    return user;
  }
}
