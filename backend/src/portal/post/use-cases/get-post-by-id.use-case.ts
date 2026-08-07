import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostAdminDetailDto } from '../dto/response/post-admin.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';

@Injectable()
export class GetPostByIdUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(id: string): Promise<PostAdminDetailDto> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
    }
    // Soft-deleted items stay reachable here on purpose — the recycle bin has
    // to be able to show what it is about to restore.
    return toAdminDetail(post);
  }
}
