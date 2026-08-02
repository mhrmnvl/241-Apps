import { AddressEntity } from '../../../../shared/domain/entities/address.entity.js';

export abstract class ISchoolUnitAddressRepository {
  abstract findBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<AddressEntity | null>;
  abstract create(
    schoolUnitId: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity>;
  abstract update(
    id: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity>;
}
