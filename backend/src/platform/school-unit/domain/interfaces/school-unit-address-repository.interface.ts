import {
  AddressEntity,
  CreateAddressRepositoryInput,
  UpdateAddressRepositoryInput,
} from '../../../../shared/domain/entities/address.entity.js';

/**
 * Writes take the address input shapes, not `Partial<AddressEntity>`.
 *
 * The entity carries `id`, `deletedAt` and the owner keys (`studentId`,
 * `teacherId`, `parentId`, `schoolUnitId`) — none of which a caller may set
 * through this port. Accepting the entity made all of them look writable, and
 * the adapter had to strip `id` back out on every call to compensate.
 */
export abstract class ISchoolUnitAddressRepository {
  abstract findBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<AddressEntity | null>;

  abstract create(
    schoolUnitId: string,
    input: CreateAddressRepositoryInput,
  ): Promise<AddressEntity>;

  abstract update(
    id: string,
    input: UpdateAddressRepositoryInput,
  ): Promise<AddressEntity>;

  /**
   * Removal is its own operation, matching the other 37 repositories. It used
   * to go through `update({ deletedAt })`, which is the only reason the write
   * contract had to expose `deletedAt` at all.
   */
  abstract softDelete(id: string): Promise<AddressEntity>;
}
