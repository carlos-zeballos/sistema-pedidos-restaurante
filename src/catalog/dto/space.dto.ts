import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsIn } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  code: string;
  
  @IsString()
  name: string;
  
  @IsIn(['MESA', 'BARRA', 'DELIVERY', 'RESERVA'])
  type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;
  
  @IsOptional()
  @IsIn(['LIBRE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO'])
  status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSpaceDto {
  @IsOptional()
  @IsString()
  code?: string;
  
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsIn(['MESA', 'BARRA', 'DELIVERY', 'RESERVA'])
  type?: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;
  
  @IsOptional()
  @IsIn(['LIBRE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO'])
  status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
  @IsOptional()
  @IsString()
  notes?: string;
}
