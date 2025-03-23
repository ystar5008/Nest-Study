import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Basic $token
    // Bearer $token
    const authHeader = req.headers['authorization'];

    console.log(authHeader);
    if (!authHeader) {
      // 다음 생명주기로 이동
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

    if (blockedToken) {
      throw new UnauthorizedException('차단된 토큰');
    }

    const cachedPayload = await this.cacheManager.get(`TOKEN_${token}`);

    if (cachedPayload) {
      console.log('cache hit');
      req.user = cachedPayload;
      return next();
    }
    // 검증X 디코드
    const decodePayload = this.jwtService.decode(token);

    if (decodePayload.type !== 'refresh' && decodePayload.type !== 'access') {
      throw new UnauthorizedException('잘못된 토큰');
    }

    try {
      const secretKey =
        decodePayload === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = Date.now();

      const differenceInSecdons = (expiryDate - now) / 1000;

      await this.cacheManager.set(
        `TOKEN_${token}`,
        payload,
        Math.max((differenceInSecdons - 30) * 1000, 1),
      );

      //요청 객체에 payload전달
      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }
      next();
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
