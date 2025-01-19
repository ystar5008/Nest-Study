import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  genre?: string;
}
