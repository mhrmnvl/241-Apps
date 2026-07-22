import { Injectable } from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HistoryQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  unitId?: string;
}

@Injectable()
export class GetHistoriesUseCase {
  constructor(private readonly repository: ICirculationRepository) {}

  async execute(query: HistoryQueryDto) {
    return this.repository.findAllHistories(query);
  }
}
