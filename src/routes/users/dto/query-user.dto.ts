import { IsInt, IsOptional, Min } from 'class-validator';

export class QueryUserDto {
  /**
  * Page index
  */
  @IsOptional()
  page?: string;

  /**
  * Size of the page
  */
  @IsOptional()
  @IsInt()
  @Min(0)
  pageSize?: number;
}
