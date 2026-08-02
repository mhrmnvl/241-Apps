import { InventoryLocationEntity } from '../entities/location.entity.js';

export abstract class ILocationRepository {
  abstract findMany(search?: string): Promise<InventoryLocationEntity[]>;
  abstract findById(id: string): Promise<InventoryLocationEntity | null>;
  abstract create(data: {
    code: string;
    name: string;
    building?: string | null;
    room?: string | null;
    rack?: string | null;
    description?: string | null;
  }): Promise<InventoryLocationEntity>;
  abstract update(
    id: string,
    data: {
      code?: string;
      name?: string;
      building?: string | null;
      room?: string | null;
      rack?: string | null;
      description?: string | null;
    },
  ): Promise<InventoryLocationEntity>;
  abstract delete(id: string): Promise<InventoryLocationEntity>;
}
