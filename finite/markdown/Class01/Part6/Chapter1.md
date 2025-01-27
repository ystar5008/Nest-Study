# Chapter 1 Class Validator 인트로

## Data Transfer Object(DTO)

- Client - Server(Layers) - Database 간 데이터 전달에 사용되는 객체

## Class Validator

- 데코레이터 기반 클래스 검증
- sync/async 지원
- [기본 제공 validator](https://github.com/typestack/class-validator?tab=readme-ov-file#validation-decorators) 및 커스텀 validator 사용 가능
- 커스텀 에러 메시지 반환 가능

```sh
$ pnpm i class-validator
# Done in 1s
```

### 기본 제공 Class Validator

- 공통 Validator
- 타입 Validator
- 숫자 Validator
- 문자 Validator

#### 반환 에러 구조

```ts
// class ValidationError
{
    target?: object;                           // 검증한 객체
    property: string;                          // 객체의 프로퍼티
    value?: any;                               // 검증 실패한 값
    constraints?: { [type: string]: string; }; // 검증 실패한 제약 조건과 메시지
    children?: ValidationError[];              // 프로퍼티의 중첩된 프로퍼티에 대한 error 목록
    contexts?: { [type: string]: any; };       // 부가정보
}
```

```ts
class User {
    @IsNumber() id = new Date();
    @IsNotEmpty() name = -Infinity;
    @IsEmail() email = '@';
}

// await
const errors: ValidationErrors[] = await validate(new User());
// promise chaining
validate(user).then(errors: ValidationError[] => { /* handle errors here */});
/*
[
    {
        "target": {
            "id": "2025-01-19T05:49:40.755Z",
            "name": null,
            "email": "@"
        },
        "value": "2025-01-19T05:49:40.755Z",
        "property": "id",
        "children": [],
        "constraints": {
            "isNumber": "id must be a number conforming to the specified constraints"
        }
    },
    {
        "target": {
            "id": "2025-01-19T05:49:40.755Z",
            "name": null,
            "email": "@"
        },
        "value": null,
        "property": "name",
        "children": [],
        "constraints": {
            "isString": "name must be a string"
        }
    },
    {
        "target": {
            "id": "2025-01-19T05:49:40.755Z",
            "name": null,
            "email": "@"
        },
        "value": "@",
        "property": "email",
        "children": [],
        "constraints": {
            "isEmail": "email must be an email"
        }
    }
]
*/
```

#### ValidationOptions

```ts
interface ValidationOptions {
    each?: boolean;
    message?: string | functionThatReturnsString;
    groups?: string[];
    always?: boolean;
    context?: any;
}

const options: ValidationOptions = {
    message: 'write your custom message here',
}

class movie {
    @IsNotEmpty(options)
    @IsString()
    title: string;
}
```

### Custom Validator

```ts
interface ValidationArguments {
    value: any;
    contraints: any[];
    targetName: string;
    object: object;
    property: string;
}

// ValidatorConstraintInterface를 구현한다
// @ValidatorConstraint() 애너테이션을 달아준다
@ValidatorConstraint()
class CustomValidator implements ValidatorContraintInterface {
    validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        // value: 검증 대상의 값
        // validation이 통과하는 조건을 리턴한다
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        // 기본 오류 메시지를 리턴한다
        // $value, $property, $targetName은 자동으로 치환된다 -> validationArguments로부터 템플릿 리터럴 쓰는 게 낫다
    }
}

// @Validate(CustomValidator)로 사용하거나
// Decorator를 직접 만들어서 사용할 수 있다(@IsCustomValid())

function IsCustomValid(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: CustomValidator,
        })
    }
}
```

### Validation Pipe의 옵션

```ts
// main.ts
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // dto에 정의된 값만 필터링해준다
    forbidNonWhiteListed: true, // whitelist에 없는 값이 들어오면 에러를 발생시킨다
    // 그외 많음
}));
```
