import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
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
}
