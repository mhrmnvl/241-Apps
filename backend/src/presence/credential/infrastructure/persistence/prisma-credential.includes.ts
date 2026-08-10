import { Prisma } from '@prisma/client';

/**
 * The holder, as thin as the card screen needs: a name to print and an avatar
 * to show at the gate. Pinning the shape here rather than in a mapper keeps the
 * query and the response DTO reading the same row.
 */
export const CREDENTIAL_HOLDER_INCLUDE = {
  user: {
    select: {
      id: true,
      identifier: true,
      isActive: true,
      profile: { select: { name: true, avatarFileId: true } },
    },
  },
} satisfies Prisma.PresenceCredentialInclude;

interface CredentialHolderRow {
  id: string;
  identifier: string;
  isActive: boolean;
  profile: { name: string; avatarFileId: string | null } | null;
}

export function toHolderRef(user: CredentialHolderRow) {
  return {
    id: user.id,
    identifier: user.identifier,
    displayName: user.profile?.name ?? null,
    photoUrl: user.profile?.avatarFileId
      ? `/files/${user.profile.avatarFileId}`
      : null,
  };
}
