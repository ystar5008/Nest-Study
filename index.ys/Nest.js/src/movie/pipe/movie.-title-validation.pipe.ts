import {
  ArgumentMetadata,
  BadGatewayException,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

//                                               PipeTransform<입력데이터 타입 =any , 반환 데이터타입 = any>
@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  //PipeTransform을 상속받으면 tranform 함수를 기본적으로 실행해야함
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }
    // metadata.data
    // metadata.metatype
    // metadata.type
    if (value.length <= 2) {
      throw new BadRequestException('영화의 제목은 3자 이상 작성해주세요');
    }
    return value;
  }
}
