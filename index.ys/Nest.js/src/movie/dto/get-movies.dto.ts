import { IsInt, IsOptional, IsString } from 'class-validator';

import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';
import { CursorPaginationDto } from './cursor-pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetMoviesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '영화 제목',
    example: '아이언맨',
  })
  title?: string;
}
