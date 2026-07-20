import { Prisma, Subject } from '@prisma/client';
import { CreateSubjectDto } from '../../dto/request/create-subject.dto.js';
import { SubjectQueryDto } from '../../dto/request/subject-query.dto.js';
import { UpdateSubjectDto } from '../../dto/request/update-subject.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const SUBJECT_LIST_INCLUDE = {
  teachingAssignments: {
    include: {
      teacher: {
        include: { user: { include: { profile: true } } },
      },
    },
  },
} satisfies Prisma.SubjectInclude;

export type SubjectWithDetails = Prisma.SubjectGetPayload<{
  include: typeof SUBJECT_LIST_INCLUDE;
}>;

export abstract class ISubjectRepository {
  abstract findAll(
    query: SubjectQueryDto,
  ): Promise<PaginatedResult<SubjectWithDetails>>;
  abstract findById(id: string): Promise<Subject | null>;
  abstract findByName(name: string): Promise<Subject | null>;
  abstract create(dto: CreateSubjectDto): Promise<Subject>;
  abstract update(id: string, dto: UpdateSubjectDto): Promise<Subject>;
  abstract remove(id: string): Promise<Subject>;
}
