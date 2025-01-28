# Chapter 2 Class Validator 완전정복

## Custom Validator

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

## Validation Pipe의 옵션

```ts
// main.ts
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // dto에 정의된 값만 필터링해준다
    forbidNonWhiteListed: true, // whitelist에 없는 값이 들어오면 에러를 발생시킨다
    // 그외 많음
}));
```
