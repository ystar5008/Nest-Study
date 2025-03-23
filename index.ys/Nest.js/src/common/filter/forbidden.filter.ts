import {
  Catch,
  ForbiddenException,
  ExceptionFilter,
  ArgumentMetadata,
  ArgumentsHost,
} from '@nestjs/common';
import { timestamp } from 'rxjs';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();

    console.log('오류' + `${request.method} ${request.path}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: '노 퍼미션',
    });
  }
}
