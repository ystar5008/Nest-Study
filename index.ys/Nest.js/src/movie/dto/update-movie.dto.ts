import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
