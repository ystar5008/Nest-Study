# 01. NestJS 라이프 사이클 오버뷰

## 라이프 사이클

Request -> Middleware? -> Guard? -> Interceptor? -> Pipe? ->
**Controller** -> **Service** -> **Repository** ->
Exception Filter? -> Interceptor? -> Response

## 모듈

요청 로직 처리 부분
`xxx.module.ts`

1. Controller: 요청에 대한 처리
2. Service: 비즈니스 로직 처리
3. Repository: DB 처리
