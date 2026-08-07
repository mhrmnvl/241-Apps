import { FileCategoryEntity } from '../entities/file-category.entity.js';
import { FileEntity } from '../entities/file.entity.js';

export interface CreateFileRepositoryInput {
  categoryId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export abstract class IFileRepository {
  abstract findMany(): Promise<FileEntity[]>;

  /**
   * Files uploaded under one application, newest first.
   *
   * Matched on the storage key, which `StorageKeyBuilder` composes as
   * `{env}/{app}/…` — there is no `appKey` column, and adding one would
   * duplicate a fact the key already carries.
   */
  abstract findManyByAppKey(appKey: string): Promise<FileEntity[]>;
  abstract findById(id: string): Promise<FileEntity | null>;
  abstract create(
    input: CreateFileRepositoryInput,
    uploadedBy?: string,
  ): Promise<FileEntity>;
  abstract softDelete(id: string): Promise<FileEntity>;
  abstract findCategories(): Promise<FileCategoryEntity[]>;
  abstract findCategoryByCode(code: string): Promise<FileCategoryEntity | null>;
  abstract findCategoryById(id: string): Promise<FileCategoryEntity | null>;
  abstract createCategory(
    code: string,
    name: string,
    description?: string,
  ): Promise<FileCategoryEntity>;
}
