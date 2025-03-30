import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request || !request.queryRunner) {
      throw new InternalServerErrorException('쿼리 객체 x');
    }

    return request.queryRunner;
  },
);
