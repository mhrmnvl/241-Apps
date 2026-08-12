import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { toSlug } from '../../../shared/helpers/slug.helper.js';
import { ITagRepository } from '../domain/interfaces/tag-repository.interface.js';
import { CreateTagDto, UpdateTagDto } from '../dto/request/tag.dto.js';

/**
 * Tag management (FR-038).
 *
 * Tags are created on first use from the post form, so these exist for tidying
 * up rather than for setting up: renaming a mistyped label, removing one that
 * was never meant to exist, and listing what is in use.
 */

@Injectable()
export class GetTagsUseCase {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(search?: string) {
    return this.tagRepository.findAll(search);
  }
}

@Injectable()
export class CreateTagUseCase {
  private readonly logger = new Logger(CreateTagUseCase.name);

  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(dto: CreateTagDto) {
    const slug = toSlug(dto.name);
    if (slug.length === 0) {
      throw new BadRequestException(
        'The tag name does not produce a valid slug',
      );
    }

    const existing = await this.tagRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Tag "${existing.name}" sudah ada.`);
    }

    const tag = await this.tagRepository.create({ name: dto.name, slug });
    this.logger.log(`Tag created: "${tag.name}"`);
    return tag;
  }
}

@Injectable()
export class UpdateTagUseCase {
  private readonly logger = new Logger(UpdateTagUseCase.name);

  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(id: string, dto: UpdateTagDto) {
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tag dengan ID ${id} not found`);
    }

    // Label only. The slug is the public filter address and stays put.
    const tag = await this.tagRepository.rename(id, dto.name);
    this.logger.log(`Tag renamed: "${existing.name}" → "${tag.name}"`);
    return tag;
  }
}

@Injectable()
export class DeleteTagUseCase {
  private readonly logger = new Logger(DeleteTagUseCase.name);

  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tag dengan ID ${id} not found`);
    }

    // No in-use guard, unlike a category. A tag is a label rather than a
    // classification: removing it drops the join rows and leaves every post
    // exactly as it was, so there is nothing to protect the editor from.
    await this.tagRepository.delete(id);
    this.logger.log(`Tag deleted: "${existing.name}"`);
  }
}
