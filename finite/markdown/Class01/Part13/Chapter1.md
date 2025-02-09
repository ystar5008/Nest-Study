# Chapter 1 Middleware 이론

- 라우트 핸들러 실행 전에 Req/Res 객체에 접근할 수 있다
  - 자유롭게 코드 실행
  - 요청과 응답 객체를 변경
  - 요청과 응답 사이클 중단
  - 다음 미들웨어 실행(next())

## 사용법

1. NestMiddleware 인터페이스를 구현한다(use 메서드를 구현한다)
2. AppModuledl NestModule을 구현하게 한다(configure 메서드를 구현한다)

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}

export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)                                 // 적용할 미들웨어
      .exclude({ path: 'director', method: RequestMethod.GET}) // 적용하지 않을 라우트(파라미터에 여러개가 들어갈 수 있고 path에 Regex도 사용가능하다)
      .forRoutes({ path: 'movie', method: RequestMethod.ALL}); // 적용할 라우트(물론 여기도 여러개가 들어갈 수 있고 path에 Regex도 사용가능하다)
    //   .forRoutes(MovieController);                          // 컨트롤러 자체를 넣을 수도 있다
  }
}

// main.ts
// 글로벌 적용
app.use(loggerMiddleware);
```
