# Chapter 3 프로바디어 & 서비스

## DI & IoC

### Dependency Injection

- 어떤 클래스에서 사용할 객체(의존성)를 그 클래스에서 직접 인스턴스화 하지 않고 DI 컨테이너로부터 인스턴스를 주입받는 패턴
- 객체 간의 결합도를 낮춘다

### Inversion of Control

- 사용자(개발자)가 아닌 프레임워크나 컨테이너에서 제어의 흐름을 관리
- IoC 컨테이너가 객체 생성, 의존성 관리, 생명주기를 관리한다
- 주입이 되는 클래스에 `@Injectable()` 애너테이션을 달아서 IoC 컨테이너에 알려준다

```ts
// movie.service.ts
const options: InjectableOptions = {
    scope: Scope.DEFAULT
    // scope: Scope.TRANSIENT // 사용 시마다 생성
    // scope: Scope.REQUEST // HTTP 요청마다 생성
}
// 주입이 되는 클래스에 작성하여 Controller에서 가져다 사용할 수 있게끔 한다
@Injectable(options)
class MovieService {}

// movie.controller.ts
class MovieController {
  // 생성자를 통해 service를 주입받는다
    constructor(private readonly movieService: MovieService) {}
}
```
