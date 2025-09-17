import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SupabaseService } from '../lib/supabase.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/space.dto';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly supabaseService: SupabaseService
  ) {}

  // ========================================
  // ENDPOINTS PÚBLICOS PARA TESTING
  // ========================================

  @Get('public/categories')
  async getCategoriesPublic() {
    return this.catalogService.getCategories();
  }

  @Get('public/products')
  async getProductsPublic(@Query('categoryId') categoryId?: string) {
    return this.catalogService.getProducts(categoryId);
  }

  @Get('public/spaces')
  async getSpacesPublic() {
    return this.catalogService.getSpaces();
  }

  @Get('public/combos')
  async getCombosPublic() {
    return this.catalogService.getCombos();
  }

  @Get('public/test')
  async testPublic() {
    return { message: 'Test endpoint working', timestamp: new Date().toISOString() };
  }

  @Get('public/diagnose-tables')
  async diagnoseTables() {
    try {
      console.log('🔍 Diagnóstico de tablas de catalog...');
      
      const results = {};
      
      // Probar cada tabla con consultas básicas
      const tables = ['Category', 'Product', 'Space', 'Combo'];
      
      for (const table of tables) {
        try {
          console.log(`🔍 Probando tabla: ${table}`);
          
          // Consulta básica solo con id
          const { data, error } = await this.supabaseService
            .getClient()
            .from(table)
            .select('id')
            .limit(1);
            
          results[table] = {
            exists: !error,
            error: error?.message || null,
            hasData: data && data.length > 0
          };
          
          console.log(`✅ ${table}:`, results[table]);
          
        } catch (tableError) {
          results[table] = {
            exists: false,
            error: tableError.message,
            hasData: false
          };
          console.log(`❌ ${table}:`, results[table]);
        }
      }
      
      return {
        ok: true,
        message: 'Diagnóstico de tablas completado',
        tables: results,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      return {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('public/spaces-simple')
  async getSpacesSimple() {
    try {
      console.log('🔍 Obteniendo espacios de forma ultra simple...');
      
      const { data, error } = await this.supabaseService
        .getClient()
        .from('Space')
        .select('*')
        .limit(10);
        
      if (error) {
        console.error('❌ Error en consulta simple de espacios:', error);
        return {
          ok: false,
          error: error.message,
          details: 'Error en consulta simple de espacios'
        };
      }
      
      console.log('✅ Espacios obtenidos exitosamente:', data?.length || 0);
      return {
        ok: true,
        message: 'Consulta simple de espacios exitosa',
        spaces: data,
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en endpoint simple de espacios:', error);
      return {
        ok: false,
        error: error.message,
        details: 'Error en endpoint simple de espacios'
      };
    }
  }

  @Get('public/categories-simple')
  async getCategoriesSimple() {
    try {
      console.log('🔍 Obteniendo categorías de forma ultra simple...');
      
      const { data, error } = await this.supabaseService
        .getClient()
        .from('Category')
        .select('*')
        .limit(10);
        
      if (error) {
        console.error('❌ Error en consulta simple de categorías:', error);
        return {
          ok: false,
          error: error.message,
          details: 'Error en consulta simple de categorías'
        };
      }
      
      console.log('✅ Categorías obtenidas exitosamente:', data?.length || 0);
      return {
        ok: true,
        message: 'Consulta simple de categorías exitosa',
        categories: data,
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error en endpoint simple de categorías:', error);
      return {
        ok: false,
        error: error.message,
        details: 'Error en endpoint simple de categorías'
      };
    }
  }

  @Get('public/categories-direct')
  async getCategoriesDirect() {
    try {
      // Llamar directamente al servicio sin pasar por el método del servicio
      const result = await this.catalogService.getCategories();
      return result;
    } catch (error) {
      console.error('Error en getCategoriesDirect:', error);
      return { error: error.message, stack: error.stack };
    }
  }

  // ========================================
  // ENDPOINTS PROTEGIDOS
  // ========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('categories')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getCategories() {
    return this.catalogService.getCategories();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('categories/:id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getCategoryById(@Param('id') id: string) {
    return this.catalogService.getCategoryById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('categories')
  @Roles('ADMIN')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.catalogService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('categories/:id')
  @Roles('ADMIN')
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('categories/:id')
  @Roles('ADMIN')
  async deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }

  // ========================================
  // PRODUCTOS
  // ========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('products')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getProducts(@Query('categoryId') categoryId?: string) {
    return this.catalogService.getProducts(categoryId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('products/:id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('products')
  @Roles('ADMIN')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    console.log('🚀 CatalogController.createProduct - Datos recibidos:');
    console.log(JSON.stringify(createProductDto, null, 2));
    console.log('📋 Tipo de datos:');
    console.log('  - code:', typeof createProductDto.code, createProductDto.code);
    console.log('  - name:', typeof createProductDto.name, createProductDto.name);
    console.log('  - categoryId:', typeof createProductDto.categoryId, createProductDto.categoryId);
    console.log('  - price:', typeof createProductDto.price, createProductDto.price);
    console.log('  - type:', typeof createProductDto.type, createProductDto.type);
    
    return this.catalogService.createProduct(createProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('products/:id')
  @Roles('ADMIN')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('products/:id')
  @Roles('ADMIN')
  async deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }

  // ========================================
  // ESPACIOS
  // ========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('spaces')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getSpaces() {
    return this.catalogService.getSpaces();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('spaces/:id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getSpaceById(@Param('id') id: string) {
    return this.catalogService.getSpaceById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('spaces')
  @Roles('ADMIN')
  async createSpace(@Body() createSpaceDto: CreateSpaceDto) {
    return this.catalogService.createSpace(createSpaceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('spaces/:id')
  @Roles('ADMIN')
  async updateSpace(@Param('id') id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.catalogService.updateSpace(id, updateSpaceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('spaces/:id')
  @Roles('ADMIN')
  async deleteSpace(@Param('id') id: string) {
    return this.catalogService.deleteSpace(id);
  }

  // ========================================
  // COMBOS
  // ========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('combos')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getCombos() {
    return this.catalogService.getCombos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('combos/:id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getComboById(@Param('id') id: string) {
    return this.catalogService.getComboById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('combos')
  @Roles('ADMIN')
  async createCombo(@Body() createComboDto: {
    code: string;
    name: string;
    basePrice: number;
    categoryId: string;
    description?: string;
    image?: string;
    isEnabled?: boolean;
    isAvailable?: boolean;
    preparationTime?: number;
    maxSelections?: number;
    components?: any[];
  }) {
    return this.catalogService.createCombo(createComboDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('combos/:id')
  @Roles('ADMIN')
  async updateCombo(@Param('id') id: string, @Body() updateComboDto: {
    code?: string;
    name?: string;
    basePrice?: number;
    categoryId?: string;
    description?: string;
    image?: string;
    isEnabled?: boolean;
    isAvailable?: boolean;
    preparationTime?: number;
    maxSelections?: number;
    components?: any[];
  }) {
    return this.catalogService.updateCombo(id, updateComboDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('combos/:id')
  @Roles('ADMIN')
  async deleteCombo(@Param('id') id: string) {
    return this.catalogService.deleteCombo(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('products-for-combo-components')
  @Roles('ADMIN')
  async getProductsForComboComponents(@Query('categoryId') categoryId?: string) {
    return this.catalogService.getProductsForComboComponents(categoryId);
  }
}

