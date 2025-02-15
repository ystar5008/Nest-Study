import { IsInt, IsOptional, IsIn, IsArray, IsString } from 'class-validator';

enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  // id_52,likeCount_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  take: number = 5;
}
