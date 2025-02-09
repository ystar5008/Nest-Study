import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
