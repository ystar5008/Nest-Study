# Chapter 1 인증 이론

## Hashing

## Token

- **Basic Token**
  - `Authorization: Basic <base64-encoded username:password>`
  - 사용자 정보(ID/PW)를 보내는 데 사용

- **Access Token**
  - `Authorization: Bearer <access-token>`
  - 프라이빗 리소스를 접근하는 데 사용
  - 만료 기간: 분 단위

- **Refresh Token**
  - Access Token을 재발급 받는 데 사용
  - 만료 기간: 일 단위

## [JWT(Json Web Token)](https://jwt.io)

- 무상태(Stateless) 인증에 사용
- 사이즈가 작고 인증 정보가 모두 담김
- `Header.Payload.Signature`
- 인증(AuthN)/인가(AuthZ)에 효율적
- 표준화된 클레임(iss, exp, sub, aud ...)

    | **Claim**            | **Desciption**                    | **Example**                                                |
    |----------------------|-----------------------------------|------------------------------------------------------------|
    | iss (Issuer)         | 토큰을 발급한 주체                    | "[https://auth.example.com](https://auth.example.com)"     |
    | exp (Expiration Time)| 토큰 만료 기한 (Unix timestamp)      | 1709440800 (2024-03-03 12:00:00 UTC)                       |
    | sub (Subject)        | 토큰이 속한 사용자 혹은 엔티티           | "user123"                                                  |
    | aud (Audience)       | 토큰이 유효한 대상 (API, 서비스 등)     | "[https://api.example.com](https://api.example.com)"       |

## Passport

- **모듈화된 인증 시스템**: 다양한 전략(strategy)를 쉽게 연결해서 사용 가능
- **미들웨어 기반 디자인**: 요청/응답 라이프사이클에 변경사항이 없다
- **일반화된 가벼운 코어**: 넓은 전략을 수용할 수 있도록 가볍고 일반적으로(unopinionated) 설계됨
- **세션 및 토큰 방식 사용**: 세션/토큰 기반 인증 시스템 모두 사용 가능
- **방대한 생태계**: 다양한 오픈소스 전략들이 공개됨. 어려운 부분을 직접 코딩할 일이 적다
