import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configservice: ConfigService) {
    super({
      // Bearer $token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 만료기간
      ignoreExpiration: false,
      secretOrKey: configservice.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  /**
   *
   * @param payload
   * @returns payload
   */
  async validate(payload: any) {
    return payload;
  }
}
