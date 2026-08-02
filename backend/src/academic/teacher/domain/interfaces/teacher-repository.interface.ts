import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { UserGender } from '../../../../shared/domain/enums/user-gender.enum.js';
import { UserEntity } from '../../../../shared/domain/entities/user.entity.js';
import {
  ProfileEntity,
  ProfileUpdateInput,
} from '../../../../platform/profile/domain/entities/profile.entity.js';
import { TeacherEntity } from '../entities/teacher.entity.js';
import {
  TeacherWithDetails,
  TeacherListWithDetails,
} from '../entities/teacher.entity.js';

export type { TeacherWithDetails, TeacherListWithDetails };

export interface TeacherQueryInput extends PaginationQueryInput {
  search?: string;
  employmentTypeId?: string;
  academicYearId?: string;
  positionCategoryId?: string;
  isActive?: boolean;
}

export interface ExportTeacherQueryInput {
  search?: string;
  employmentTypeId?: string;
  isActive?: boolean;
}

export interface CreateTeacherRepositoryInput {
  /** Falls back to NIP/NUPTK/NIK when the caller leaves it blank. */
  identifier?: string;
  name: string;
  nik: string;
  gender: UserGender;
  birthPlace: string;
  birthDate: Date;
  email?: string;
  phone?: string;
  nip?: string;
  nuptk?: string;
  employmentTypeId: string;
  positionId?: string;
}

export interface UpdateTeacherRepositoryInput {
  nip?: string;
  nuptk?: string;
  employmentTypeId?: string;
}

export abstract class ITeacherRepository {
  abstract toggleUserActive(
    userId: string,
    isActive: boolean,
  ): Promise<UserEntity>;
  abstract findAll(
    query: TeacherQueryInput,
  ): Promise<PaginatedResult<TeacherListWithDetails>>;
  abstract findAllForExport(
    filters: ExportTeacherQueryInput,
  ): Promise<TeacherListWithDetails[]>;
  abstract findById(id: string): Promise<TeacherWithDetails | null>;
  abstract findUserByIdentifier(identifier: string): Promise<UserEntity | null>;
  abstract findProfileByNik(nik: string): Promise<ProfileEntity | null>;
  abstract findByUserId(userId: string): Promise<TeacherEntity | null>;
  abstract findByNip(
    nip: string,
    excludeId?: string,
  ): Promise<TeacherEntity | null>;
  abstract findByNuptk(
    nuptk: string,
    excludeId?: string,
  ): Promise<TeacherEntity | null>;
  abstract findProfileByUserId(
    userId: string,
    nik: string,
  ): Promise<ProfileEntity | null>;
  abstract updateProfile(
    userId: string,
    data: ProfileUpdateInput,
  ): Promise<ProfileEntity>;
  abstract create(
    input: CreateTeacherRepositoryInput,
    hashedPassword: string,
  ): Promise<TeacherWithDetails>;
  abstract update(
    id: string,
    input: UpdateTeacherRepositoryInput,
  ): Promise<TeacherWithDetails>;
  abstract resolveEmploymentTypeId(code: string): Promise<string>;
  abstract softDelete(
    id: string,
    userId: string,
  ): Promise<[TeacherEntity, UserEntity]>;
  abstract getActiveEmploymentTypeCodes(): Promise<string[]>;
}
