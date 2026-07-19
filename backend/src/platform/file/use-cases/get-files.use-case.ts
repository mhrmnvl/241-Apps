import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository.js';

@Injectable()
export class GetFilesUseCase {
  constructor(private readonly repo: FileRepository) {}

  async execute() {
    return this.repo.findMany();
  }
}
