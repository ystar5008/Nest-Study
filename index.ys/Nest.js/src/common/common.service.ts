import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from 'src/movie/dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;

    const skip = (page - 1) * take;
    qb.take(take);
    qb.skip(skip);
  }

  applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { order, id, take } = dto;

    console.log(order, id, take);
    if (id) {
      const direction = order === 'ASC' ? '>' : '<';
      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }
    //alias => 선택한 테이블 별칭
    qb.orderBy(`${qb.alias}.id`, order);

    qb.take(take);
  }
}
