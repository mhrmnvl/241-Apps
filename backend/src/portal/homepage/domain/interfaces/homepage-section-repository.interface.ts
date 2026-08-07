export interface HomepageSectionEntity {
  id: string;
  key: string;
  itemCount: number;
  isEnabled: boolean;
  displayOrder: number;
}

export interface UpdateHomepageSectionInput {
  itemCount?: number;
  isEnabled?: boolean;
  displayOrder?: number;
}

export abstract class IHomepageSectionRepository {
  abstract findAllEnabled(): Promise<HomepageSectionEntity[]>;
  abstract findAll(): Promise<HomepageSectionEntity[]>;
  abstract findByKey(key: string): Promise<HomepageSectionEntity | null>;
  abstract update(
    key: string,
    data: UpdateHomepageSectionInput,
  ): Promise<HomepageSectionEntity>;
}
