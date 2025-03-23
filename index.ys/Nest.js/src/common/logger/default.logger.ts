import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  warn(message: unknown, ...rest: unknown[]): void {
    console.log('---위험로그---');
    super.warn(message, ...rest);
  }

  error(message: unknown, ...rest: unknown[]): void {
    // 에러 발생시 에러 파일에 저장 및 위험 알림 모니터링 기능 추가
    console.log('---에러로그---');
    super.error(message, ...rest);
  }
}
