import { FileCategoryEntity, FileEntity } from '../entities/file.entity.js';

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
