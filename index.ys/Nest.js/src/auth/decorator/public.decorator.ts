import { Reflector } from '@nestjs/core';

// 메타데이터를 설정하고 검색하는 기능
// 주로 인증(Authorization) 및 접근 제어(Access Control) 에서 사용됩니다.
export const Public = Reflector.createDecorator();
