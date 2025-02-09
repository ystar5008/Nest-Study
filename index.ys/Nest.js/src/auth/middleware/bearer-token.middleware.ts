import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from 'src/common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Basic $token
    // Bearer $token
    const authHeader = req.header['authorization'];

    if (!authHeader) {
      // 다음 생명주기로 이동
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    try {
      // 검증X 디코드
      const decoedPayload = this.jwtService.decode(token);

      if (decoedPayload.type !== 'refresh' && decoedPayload.type !== 'access') {
        throw new UnauthorizedException('잘못된 토큰');
      }

      const secretKey =
        decoedPayload === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      //요청 객체에 payload전달
      req.user = payload;
      next();
    } catch (e) {
      throw new UnauthorizedException('토큰 만료');
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됨');
    }

    return token;
  }
}
