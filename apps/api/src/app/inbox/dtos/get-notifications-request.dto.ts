import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { CursorPaginationRequestDto } from '../../shared/dtos/cursor-pagination-request';

const LIMIT = {
  DEFAULT: 10,
  MAX: 100,
};

export class GetNotificationsRequestDto extends CursorPaginationRequestDto(LIMIT.DEFAULT, LIMIT.MAX) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  read?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  archived?: boolean;
}
