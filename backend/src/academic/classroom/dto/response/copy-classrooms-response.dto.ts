import { ApiProperty } from '@nestjs/swagger';

/** What a copy did, so the screen can say so rather than just succeed. */
export class CopyClassroomsResponseDto {
  @ApiProperty({
    example: 5,
    description: 'Classrooms added to the target year',
  })
  created: number;

  @ApiProperty({
    example: 1,
    description:
      'Already there, matched on grade and code. Running the copy twice ' +
      'reports every classroom skipped and changes nothing.',
  })
  skipped: number;
}
