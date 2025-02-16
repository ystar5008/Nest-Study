import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();

    //응답으로 나감
    return next.handle().pipe(
      //함수가 순서대로 실행됨
      tap(() => {
        const respTime = Date.now();
        const diff = respTime - reqTime;
        console.log(`[${req.method} ${req.path}] ${diff}ms `);
      }),
    );
  }
}
