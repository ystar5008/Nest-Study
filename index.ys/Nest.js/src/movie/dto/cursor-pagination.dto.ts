import { IsInt, IsOptional, IsIn } from 'class-validator';

enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CursorPaginationDto {
  @IsInt()
  @IsOptional()
  id: number;

  @IsIn(Object.values(Order))
  @IsOptional()
  order: Order = Order.DESC;

  @IsInt()
  @IsOptional()
  take: number = 5;
}
