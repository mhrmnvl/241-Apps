import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateWorkflowStepDto {
  @ApiProperty({ description: 'Sequence number of the step (1-indexed)' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  stepSequence: number;

  @ApiProperty({
    description:
      'Role code authorized to approve this step (e.g. ADMIN, PRINCIPAL)',
  })
  @IsString()
  @IsNotEmpty()
  approverRoleId: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Name of the workflow' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Target entity class name' })
  @IsString()
  @IsNotEmpty()
  targetEntity: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateWorkflowStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkflowStepDto)
  steps: CreateWorkflowStepDto[];
}
