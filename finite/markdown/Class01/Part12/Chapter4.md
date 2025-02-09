# Chapter 4 Passport

## Local Strategy

- Passport Strategy를 상속한다
  - 기본적으로 { username: string, password: string }을 받으므로 이를 변경하고싶으면 생성자에서 usernameField, passwordField를 지정해줘야 한다

- validate 메서드를 구현해야 한다(중요한건 아니지만 상속이 아니다)
  - 입력받은 username과 password를 확인하고 일치하면 사용자 정보를 반환하고 일치하지 않으면 throw 해서 결과적으로 undefined가 반환된다
  - !! 반환값은 `req.user`에 저장된다
  - controller에서 req.user에서 가져다 쓸 수 있지만 기본적으로 타입 정보가 없으므로 Express의 Request를 import 하는 등 타입 일치를 잘 시켜줘야 한다(실제 코드 참고)

### JWT Strategy

- jwtFromRequest: 어디서 토큰을 추출하는지 지정해줘야 한다
  - fromAuthHeaderAsBearerToken
  - fromAuthHeaderWithScheme
  - fromBodyField
  - fromExtractors
  - fromHeader
  - fromUrlQueryParameter
- ignoreExpiration: true -> 토큰이 만료되어도 인증을 통과시킨다
- secretOrKey: 토큰을 검증하는데 사용되는 비밀키

- validate 메서드를 구현해야 한다
  - 반환값은 `req.user`에 저장된다
