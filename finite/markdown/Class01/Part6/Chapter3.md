# Chapter 3 Class Transformer

## 특징

- 데코레이터 기반 클래스 변환
- (역)직렬화
- 중첩된 객체에도 사용 가능
- 커스텀 transformer 사용 가능

클래스에만 적용되고 객체에는 적용되지 않는다

```ts
interface IMovie {
    id: number;
    title: string;
    genre: string;
}

class Movie {
    id: number;
    title: string;
    genre: string;
}

const id = 1, title = 'The Dark Knight', genre = 'Super Hero';
const iMovie: IMovie = { id, title, genre };
const movie: Movie = new Movie(id, title, genre);

iMovie instanceof Movie; // -> false
movie instanceof Movie; // -> true
```

## 적용 예제

```ts
class User {
    @Exclude()
    name: string;

    @Transform(({ value }) => value.toUpperCase())
    email: string;
}

const plainUser = { name: 'John', email: 'john@example.com' };
const user: User = plainToInstance(User, plainUser);
console.log(user);
// User { email: 'JOHN@EXAMPLE.COM' }

const plain: Record<string, any> = instanceToPlain(user);
console.log(plain);
// { email: 'JOHN@EXAMPLE.COM' }
```

## Expose / Exclude

- Exclude: 직렬화 시에 프로퍼티를 배제한다
- Expose: 직렬화 시에 프로퍼티를 포함한다(주로 클래스 레벨에 사용)
  - 메서드는 기본적으로 배제된다
- 역직렬화 시에는 `plainToInstance()`를 사용하는 경우에는 배제되고 `Object.assign()`, `constructor()` 등에는 영향이 없다

## Custom Transformer

```ts
interface TransformFn {
    (params: TransformFnParams): any;
}

interface TransformFnParams {
    value: any;
    key: string;
    obj: any;
    type: TransformationType;
    options: ClassTransformOptions,
}

interface TransformOptions {
    since?: number;
    until?: number;
    groups?: string[];
    toClassOnly?: boolean;
    toPlainOnly?: boolean;
}

const transformFn: TransformFn = (params: TransformFnParams) => { return params.value.toString().toLowerCase(); };
const options: TransformOptions = {};

// 적절히 변형해서 리턴해준다
@Transform(transformFn, options)
email: string;
```
