import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsUUID, Min, IsIn } from 'class-validator';

export class CreateProductDto {
  @IsString()
  code: string;
  
  @IsString()
  name: string;
  
  @IsUUID()
  categoryId: string;
  
  @IsNumber()
  @Min(0)
  price: number;
  
  @IsOptional()
  @IsIn(['COMIDA', 'BEBIDA', 'POSTRE', 'COMBO', 'ADICIONAL'])
  type?: 'COMIDA' | 'BEBIDA' | 'POSTRE' | 'COMBO' | 'ADICIONAL';
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  preparationTime?: number;
  
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
  
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];
  
  @IsOptional()
  nutritionalInfo?: Record<string, any>;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  code?: string;
  
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  
  @IsOptional()
  @IsIn(['COMIDA', 'BEBIDA', 'POSTRE', 'COMBO', 'ADICIONAL'])
  type?: 'COMIDA' | 'BEBIDA' | 'POSTRE' | 'COMBO' | 'ADICIONAL';
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  preparationTime?: number;
  
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
  
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];
  
  @IsOptional()
  nutritionalInfo?: Record<string, any>;
}
