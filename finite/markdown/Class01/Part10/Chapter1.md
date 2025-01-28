# Chapter 2 Mapped Types 정리

## Mapped Types 정리

- TypeScript의 ([Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html))와 이름이 같은데
- 메서드 이름은 [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)와 같고 기능이 비슷한 개념
- NestJS 자체 기능
  - NOTE: Utility Type은 타입에 사용하고
  - Mapped Types는 dto에 사용하며 class 상속의 개념이다

### 종류

#### Partial

클래스의 프로퍼티를 모두 optional로 변경

### PartialType

```ts
class CreateUserDto {
    @IsString() readonly name: string;
    @IsEmail() readonly email: string;
    @IsString() readonly password: string;
}

class UpdateUserDto extends PartialType(CreateUserDto) {}
/**
    // ParitialType을 상속받으면 눈에 보이지는 않지만 @IsOptional()이 모든 프로퍼티에 자동으로 붙는다고 이해해야 한다
    {
        @IsString() readonly name?: string;
        @IsEmail() readonly email?: string;
        @IsString() readonly password?: string;
    }
*/
// cf. Partial<Type>
interface CreateUser{
    readonly name: string;
    readonly email: string;
    readonly password: string;
}

interface UpdateUser extends Partial<CreateUser> {}
/* or */ type UpdateUser = Partial<CreateUser>
```

### PickType

클래스의 프로퍼티를 지정하여 선택

```ts
class LoginUserDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}
/**
    {
        @IsString() readonly email: string;
        @IsString() readonly password: string;
    }
*/

```

### OmitType

클래스의 프로퍼티를 지정하여 제외

```ts
class PublicUser extends OmitType(CreateUserDto, ['password'] as const) {}
/**
    {
        @IsString() readonly name: string;
        @IsString() readonly email: string;
    }
*/
```

### IntersectionType

두 클래스의 프로퍼티를 합집합

```ts
class UserDetaislDto {
    @IsString() readonly name: string;
    @IsEmail() readonly email: string;
}

class AddressDto {
    @IsString() readonly street: string;
    @IsString() readonly city: string;
    @IsString() readonly country: string;
}

class UserWithAddressSto extends IntersectionType(UserDetailsDto, AddressDto) {}
/**
    {
        @IsString() readonly name: string;
        @IsEmail() readonly email: string;
        @IsString() readonly street: string;
        @IsString() readonly city: string;
        @IsString() readonly country: string;
    }
*/
```

### Composition

타입은 아니고 Mapped Type을 중첩하는 개념

```ts
class UpdateCatDto extends PartialType(OmitType(CreateCatDto, ['name'] as const)) {}
```
