# Chapter 2 회원가입

```ts
parseBasicToken(rawToken: string): Pick<User, 'email' | 'password'>
// 1. 헤더의 Authorization 속성에서 Basic을 떼어낸다.
// 2. base64 디코딩한다
// 3. ':' 기준으로 나누어 이메일과 비밀번호를 반환한다

parseBearerToken(rawToken: string): Payload
// 1. 헤더의 Authorization에서 Bearer을 떼어낸다
// 2. 시크릿 키를 사용하여 토큰을 검증한다
// 3. refresh token 여부를 확인한다 -> 메서드의 이름이 parseBearerToken이므로 token의 type을 따지지 말고 parse 해주는 것이 더 맞다
// 4. payload를 반환한다

type RegisteredClaim = {
    iss?: string; // issuer
    sub?: number; // subject
    aud?: string; // audience
    exp?: number; // expiration
    nbf?: number; // not before
    iat?: number; // issued at
    jti?: string; // jwt id
};

type TokenType = 'access' | 'refresh'

type JwtClaim = {
    sub: number;
    role: Role; // enum Role { admin, paidUser, user}
    tokenType?: TokenType;
}

// enum의 요소는 이런식으로 대문자로 하는 게 좋다
// enum의 요소의 값을 숫자로 하니까 클라이언트와 DB에서 값이 숫자로만 보여서 불편했다 -> 개인적으로 문자열 선호
enum Role {
    ADMIN = 'admin',
    PAID_USER = 'paidUser',
    USER = 'user'
}

// sub가 RegisteredClaim에서는 optional이므로 불가피하게 Omit을 써서 required로 만들어준다
type Payload = Omit<JwtClaim, 'sub'> & RegisteredClaim
```

- 이미 존재하는 이메일의 경우 400 Bad Request 응답보다는 409 Conflict 응답이 더 적합하다
- HASH ROUND말고도 SALT를 사용할 수 있다
