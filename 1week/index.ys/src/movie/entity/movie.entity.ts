import { Exclude, Expose, Transform } from 'class-transformer';

export class Movie {
  id: number;
  title: string;
  // 값 변경
  @Transform((value) => `${value}장르`)
  genre: string;
}
