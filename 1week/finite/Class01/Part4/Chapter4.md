# Chapter 4 모듈

## Module의 개념

```ts
export interface ModuleMetaData {
    imports?: ...;              // 다른 모듈들
    controllers?: Type<any>[];  // 컨트롤러
    providers?: Provider[];     // inject할 수 있는 것들
    exports?: ...;              // 이 모듈에서 export할 것들
}
export declare function Module(metadata: ModuleMetadata): ClassDecorator;

// app.module.ts
const metaData: ModuleMetaData = {
    imports: [],
    controllers: [AppController],
    providers: [],
    exports: []
}
@Module(metaData)
class AppModule {}
```

## Module의 생성

```sh
# $ nest generate|g resource|res [name] [options] [path]
$ nest g res movie
? Transport layer
> REST API
  GraphQL (code first)
  GraphQL (schema first)
  Microservice (non-HTTP)
  WebSockets
? generate CRUD entry points? (Y/n)
```

## CRUD Endpoints

| **Layer \ ACTION** | **CREATE** | **READ**              | **UPDATE**  | **DELETE** |
|--------------------|------------|-----------------------|-------------|------------|
| **HTTP**           | POST       | GET                   | PATCH / PUT | DELETE     |
| **Controller**     | create()   | findAll() / findOne() | update()    | remove()   |
| **Service**        | create()   | findAll() / findOne() | update()    | remove()   |
| **Repository**     | save()     | find() / findOne()    | update()    | delete()   |
