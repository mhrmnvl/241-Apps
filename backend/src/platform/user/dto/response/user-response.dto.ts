import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'admin01' })
  identifier!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class UserListResponseDto {
  @ApiProperty({ type: () => [UserResponseDto] })
  data!: UserResponseDto[];

  @ApiProperty({ example: { page: 1, limit: 10, total: 50, totalPages: 5 } })
  meta!: { page: number; limit: number; total: number; totalPages: number };
}
