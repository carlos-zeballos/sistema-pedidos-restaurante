import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;
  
  @IsNumber()
  @Min(0)
  ord: number;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  ord?: number;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
