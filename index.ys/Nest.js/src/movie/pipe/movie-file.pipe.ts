import {
  ArgumentMetadata,
  BadGatewayException,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { rename } from 'fs/promises';
import path, { join } from 'path';

@Injectable()
export class MovieFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  constructor(
    private readonly options: {
      maxSize: number;
      mimetype: 'video/mp4' | 'image/jpeg' | 'image/png';
    },
  ) {}

  async transform(
    value: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수');
    }

    const byteSize = this.options.maxSize * 1000000;

    if (value.size > byteSize) {
      throw new BadRequestException(
        `${this.options.maxSize}MB 이하만 가능합니다.`,
      );
    }

    if (value.mimetype !== this.options.mimetype) {
      throw new BadRequestException(`${this.options.mimetype}만 가능합니다.`);
    }

    const split = value.originalname.split('.');

    let extesion = 'mp4';

    if (split.length > 1) {
      extesion = split[split.length - 1];
    }

    const filename = `${v4()}_${Date.now()}.${extesion}`;
    const newPath = join(value.destination, filename);

    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}
