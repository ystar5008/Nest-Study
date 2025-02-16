import { IsInt, IsOptional, IsString } from 'class-validator';

import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';
import { CursorPaginationDto } from './cursor-pagination.dto';

export class GetMoviesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
