import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsIn, IsArray, IsString } from 'class-validator';

enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '페이지네이션 커서',
    example: 'ey어쩌구',
  })
  // id_52,likeCount_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  @ApiProperty({
    description: '내림차순 혹은 오름차순',
    example: ['id_DESC'],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: '가져올 데이터 갯수',
    example: 5,
  })
  take: number = 5;
}
