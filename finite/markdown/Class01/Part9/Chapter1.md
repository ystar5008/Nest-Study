# Chapter 1 Pipe 이론

## 적용 순서

1. Request ->
2. Middleware ->
    -> Global Middleware -> Module Middleware ->
3. Guards ->
    Global Guards -> Controller Guards -> Route Guards ->
4. Interceptors ->
    Global Interceptors -> Controller Interceptors -> Route Interceptors ->
5. Pipes ->
    Global Pipes -> Controller Pipes -> Route Pipes -> Route Parameter Pipes ->
6. Controller ->
7. Service -> Repository ->
8. Interceptors ->
   (역순) Route Interceptors -> Controller Interceptors -> Global Interceptors ->
9. Exception Fileters
    -> Route -> Controller -> Global ->
10. Response

## Pipe란?

Controller의 메서드 인자를 가공한 후 Controller에 전달

## Pipe의 종류

Class 자체를 인자로 넘겨도 되고 option이 필요한 경우 인스턴스를 넘겨도 된다

```ts
// main.ts
const app = await NestFactory.create(AppModule);
app.useGlobalPipes(new MyGlobalPipe());            // Global Pipe

                                                   // someEntity.controller.ts
@Controller
@UsePipes(new MyControllerPipe())                  // Controller Pipe
export class SomeEntityController {
    @Get()
    @UsePipes(new MyRoutePipe())                   // Route Pipe
    getSomeEntity(@Param('id', RouteParamPipe)) {} // Route Parameter Pipe 일반적으로 많이 사용
}
```

## 기본 Pipe 타입

검증만 하고 변환은 안 하는 것들도 있다

- ValidationPipe     // DTO 유효성 검사
- ParseIntPipe       // 문자열을 정수로 변환
- ParseFloatPipe     // 문자열을 실수로 변환
- ParseBoolPipe      // 문자열을 불리언으로 변환
- ParseArrayPipe     // 문자열을 배열로 변환

- ParseUUIDPipe      // UUID 형식 검증
- ParseEnumPipe      // Enum 값 검증
- DefaultValuePipe   // 값이 없을 때 기본값 설정
- ParseFilePipe      // 파일 업로드 검증 -> Multer를 대신 사용

### Custom Pipe

```ts
// 아래 인터페이스를 구현해야 한다
interface PipeTransform<T = any, R = any> {
    transform(value: T, metaData: ArgumentMetadata): R;
}

@Injectable() // ? service처럼 provider로 관리된다 -> 근데 module.ts에 안 적어도 되는 이유는?
export class MyPipe<T = any, R = any> implements PipeTransform<T, R> { // PipeTransform<매개변수 타입, 반환 타입>

    // 필요할 경우 options 사용
    constructor(private readonly options?: { allowNull?: boolean })

    // 구현해야하는 메서드
    transform(value: T, metadata: ArgumentMetadata): R {
        let transformedValue: R;
        // 변환 로직
        return transformedValue;
        // return value as unknown as R;
    }
}

interface ArgumentMetadata {
    type: Paramtype;                  // 'body' | 'query' | 'param' | 'custom' 중 하나(Pipe 구현부 내에서 구분할 수 있게 해준다)
    metatype?: Type<any> | undefined; // Pipe 대상이되는 인자에 지정한 타입 (default: undefined)
                                        // 단, [string, boolean, number, array, object]는 박싱된다
    data?: string | undefined;        // 데코레이터에 전달한 인자
}

// ex1. { type: 'param', metadata: 'Number', data: 'id' }
findOne(@Param('id', MyPipe) movieId: number) {}


// ex2. { type: 'query', metadata: 'String' data: 'title' }
findAll(@Query('title', new MyPipe<string, string>({ allowNull: true })) movieTitle: string)
```
