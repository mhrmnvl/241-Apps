import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '@prisma/client';

export class ProfileResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Profile ID',
    example: '550e8400-e29b-41d4-a716-446655440015',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Owner user ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  userId!: string;

  @ApiProperty({ example: 'Ahmad Fauzi' })
  name!: string;

  @ApiProperty({ example: '3578010101080001' })
  nik!: string;

  @ApiProperty({ enum: UserGender, example: UserGender.MALE })
  gender!: UserGender;

  @ApiProperty({ example: 'Malang' })
  birthPlace!: string;

  @ApiProperty({ example: '2008-01-01' })
  birthDate!: string;

  @ApiPropertyOptional({ example: 'ahmad.fauzi@email.com' })
  email?: string | null;

  @ApiPropertyOptional({ example: '081234567890' })
  phone?: string | null;
}
