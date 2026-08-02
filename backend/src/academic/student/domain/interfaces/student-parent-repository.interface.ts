import {
  StudentParentEntity,
  StudentParentWithDetails,
} from '../entities/student-parent.entity.js';
import { ParentRelation } from '../../../../shared/domain/enums/parent-relation.enum.js';

export type { StudentParentWithDetails };

/** Existence probes used by the link flow — only the id is read. */
export interface StudentRef {
  id: string;
}

export interface ParentRef {
  id: string;
}

export interface CreateStudentParentRepositoryInput {
  studentId: string;
  parentId: string;
  relation: ParentRelation;
  isPrimary?: boolean;
}

export interface UpdateStudentParentRepositoryInput {
  parentId?: string;
  relation?: ParentRelation;
  isPrimary?: boolean;
}

export abstract class IStudentParentRepository {
  abstract findByStudentId(
    studentId: string,
  ): Promise<StudentParentWithDetails[]>;
  abstract findAll(studentId: string): Promise<StudentParentWithDetails[]>;
  abstract findById(id: string): Promise<StudentParentWithDetails | null>;
  abstract findStudent(studentId: string): Promise<StudentRef | null>;
  abstract findParent(parentId: string): Promise<ParentRef | null>;
  abstract findPair(
    studentId: string,
    parentId: string,
  ): Promise<StudentParentWithDetails | null>;
  abstract findByStudentAndParent(
    studentId: string,
    parentId: string,
  ): Promise<StudentParentWithDetails | null>;
  abstract create(
    input: CreateStudentParentRepositoryInput,
  ): Promise<StudentParentWithDetails>;
  abstract update(
    id: string,
    input: UpdateStudentParentRepositoryInput,
    studentId?: string,
  ): Promise<StudentParentWithDetails>;
  abstract remove(id: string): Promise<StudentParentEntity>;
  abstract clearPrimaryForStudent(
    studentId: string,
    excludeId?: string,
  ): Promise<{ count: number }>;
}
