import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { In } from 'typeorm';

export const WsQueryRunner = createParamDecorator(
  (data, context: ExecutionContext) => {
    const client = context.switchToWs().getClient();

    if (!client || !client.data || !client.data.queryRunner) {
      throw new InternalServerErrorException('쿼리 객체 x');
    }

    return client.data.queryRunner;
  },
);
