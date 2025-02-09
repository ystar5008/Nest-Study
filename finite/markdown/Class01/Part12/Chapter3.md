# Chapter 3 로그인

- 로그인에 성공하면 access token과 refresh token을 발급한다
- 강의에서 accessTokenSecret, refreshTokenSecret 값을 동일하게 써서 실수했을 때 알아차리지 못했다
  - 따라서 개발단계에서라도 무조건 accessTokenSecret, refreshTokenSecret를 다르게 설정해야 한다
- accessToken, refreshToken의 만료 시간도 환경변수로 빼내야 하지만 .env에 PROD 설정하는 법을 아직 모른다
