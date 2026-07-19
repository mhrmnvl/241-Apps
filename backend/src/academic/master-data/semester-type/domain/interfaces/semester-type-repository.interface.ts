import { SemesterType } from '@prisma/client';
import { SemesterTypeQueryDto } from '../../dto/semester-type-query.dto.js';
import { Prisma } from '@prisma/client';

export abstract class ISemesterTypeRepository {
  abstract findAll(query: SemesterTypeQueryDto): Promise<{
    data: SemesterType[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract findById(id: string): Promise<SemesterType | null>;
  abstract findByName(name: string): Promise<SemesterType | null>;
  abstract create(data: {
    name: string;
    isActive: boolean;
  }): Promise<SemesterType>;
  abstract update(
    id: string,
    data: Prisma.SemesterTypeUpdateInput,
  ): Promise<SemesterType>;
  abstract delete(id: string): Promise<SemesterType>;
  abstract hasRelatedData(id: string): Promise<boolean>;
}
