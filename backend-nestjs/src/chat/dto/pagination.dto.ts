import { IsOptional, IsNumber } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsNumber()
  skip?: number = 0;
}
