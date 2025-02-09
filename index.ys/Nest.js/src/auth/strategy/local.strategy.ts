import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('local') {}

// 이메일과 비밀번호로 로그인 전략
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      //username 필드를 => email로 변경
      usernameField: 'email',
    });
  }
  // 실제 존재하는 사용자인지 검증

  /**
   *
   * @param username string
   * @param password
   * @Body username, password
   * @return => Request
   */
  async validate(username: string, password: string) {
    const user = await this.authService.authenticate(username, password);

    console.log(user);
    return user;
  }
}
