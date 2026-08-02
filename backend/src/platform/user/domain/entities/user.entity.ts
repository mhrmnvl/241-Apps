import { BaseEntity } from '../../../../shared/domain/base/entity.base.js';

export class UserEntity extends BaseEntity<string> {
  constructor(
    id: string,
    public readonly identifier: string,
    public readonly passwordHash: string,
    public readonly isActive: boolean,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id);
  }
}

export interface UserPublic {
  id: string;
  identifier: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
