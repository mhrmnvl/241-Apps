import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'Homeroom Teacher',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The description of the role',
    example: 'Institution Homeroom Teacher role',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'IDs of permissions to grant. When provided, replaces the full set.',
    type: [String],
    required: false,
    example: ['d3b07384-d113-4ec2-a5d9-4d64bc86ef34'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}
