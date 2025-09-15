import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ord: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  prepTimeMinutes?: number;
  image?: string;
  type?: 'COMIDA' | 'BEBIDA' | 'POSTRE' | 'COMBO' | 'ADICIONAL';
  preparationTime?: number;
  isEnabled?: boolean;
  allergens?: string[];
  nutritionalInfo?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Space {
  id: string;
  name: string;
  type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
  capacity?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CatalogService {
  constructor(private supabaseService: SupabaseService) {}

  // ========================================
  // CATEGORÍAS
  // ========================================

  async getCategories() {
    try {
      console.log('🔍 CatalogService.getCategories() - Iniciando...');
      
      const client = this.supabaseService.getClient();
      console.log('✅ Cliente Supabase obtenido');
      
      const { data, error } = await client
        .from('Category')
        .select('id,name,description,image,ord,isActive,createdAt,updatedAt')
        .eq('isActive', true)
        .order('ord', { ascending: true });

      console.log('📊 Query ejecutada - Data:', data?.length, 'Error:', error);

      if (error) {
        console.error('❌ Error en getCategories:', error);
        throw new HttpException(`Error getting categories: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log('✅ getCategories exitoso - Categorías:', data?.length);
      return data as Category[];
    } catch (e) {
      console.error('❌ Error inesperado en getCategories:', e);
      throw new HttpException(`Unexpected error getting categories: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategoryById(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Category')
      .select('id,name,description,image,ord,isActive,createdAt,updatedAt')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return data as Category;
  }

  async createCategory(createCategoryDto: {
    name: string;
    ord: number;
    description?: string;
    image?: string;
    isActive?: boolean;
  }) {
    try {
      const { data: categoryId, error } = await this.supabaseService.getClient()
        .rpc('category_upsert', {
          p_name: createCategoryDto.name,
          p_ord: createCategoryDto.ord,
          p_id: null,
          p_description: createCategoryDto.description ?? null,
          p_image: createCategoryDto.image ?? null,
          p_is_active: createCategoryDto.isActive ?? true
        });

      if (error) {
        console.error('❌ ERROR DETALLADO EN CREAR CATEGORÍA:');
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        console.error('   - Error details:', error.details);
        console.error('   - Error hint:', error.hint);
        console.error('   - Error completo:', JSON.stringify(error, null, 2));
        console.error('   - Datos enviados:', JSON.stringify({
          p_name: createCategoryDto.name,
          p_ord: createCategoryDto.ord,
          p_id: null,
          p_description: createCategoryDto.description ?? null,
          p_image: createCategoryDto.image ?? null,
          p_is_active: createCategoryDto.isActive ?? true
        }, null, 2));
        throw new HttpException(`Error creating category: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener la categoría completa
      return await this.getCategoryById(categoryId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error creating category: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCategory(id: string, updateCategoryDto: {
    name?: string;
    ord?: number;
    description?: string;
    image?: string;
    isActive?: boolean;
  }) {
    try {
      // Verificar que la categoría existe
      await this.getCategoryById(id);

      const { data: categoryId, error } = await this.supabaseService.getClient()
        .rpc('category_upsert', {
          p_name: updateCategoryDto.name ?? '',
          p_ord: updateCategoryDto.ord ?? 0,
          p_id: id,
          p_description: updateCategoryDto.description ?? null,
          p_image: updateCategoryDto.image ?? null,
          p_is_active: updateCategoryDto.isActive ?? true
        });

      if (error) {
        throw new HttpException(`Error updating category: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener la categoría actualizada
      return await this.getCategoryById(categoryId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating category: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCategory(id: string) {
    await this.getCategoryById(id);

    // Verificar si hay productos en esta categoría
    const { data: productsInCategory, error: productsError } = await this.supabaseService.getClient()
      .from('Product')
      .select('id')
      .eq('categoryId', id);

    if (productsError) {
      throw new HttpException(`Error checking products in category: ${productsError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (productsInCategory && productsInCategory.length > 0) {
      throw new HttpException('No se puede eliminar una categoría que tiene productos', HttpStatus.BAD_REQUEST);
    }

    const { error } = await this.supabaseService.getClient()
      .from('Category')
      .delete()
      .eq('id', id);

    if (error) {
      throw new HttpException(`Error deleting category: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Categoría eliminada exitosamente' };
  }

  // ========================================
  // PRODUCTOS
  // ========================================

  async getProducts(categoryId?: string) {
    console.log('🔍 CatalogService.getProducts() - Iniciando... [FORZAR ACTUALIZACION]');
    try {
      const supabase = this.supabaseService.getClient();

      let query = supabase
        .from('Product')
        .select(`
          id, name, description, price, image, type,
          "categoryId", "preparationTime", "isEnabled", "isAvailable",
          allergens, "nutritionalInfo", "createdAt", "updatedAt"
        `)
        .eq('isEnabled', true)
        .order('name', { ascending: true });

      if (categoryId) {
        query = query.eq('categoryId', categoryId);
      }

      const { data, error } = await query;

      console.log('📊 Query productos - Data:', data?.length ?? 0, 'Error:', error);

      if (error) {
        console.error('❌ getProducts supabase error:', error);
        throw new HttpException(`Error getting products: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log('✅ getProducts exitoso - Productos:', data?.length);
      return data as Product[];
    } catch (e: any) {
      console.error('💥 Error en getProducts():', e);
      throw new HttpException(`Error getting products: ${e?.message ?? e}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductById(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Product')
      .select('id,name,description,price,image,type,categoryId,preparationTime,isEnabled,isAvailable,allergens,nutritionalInfo,createdAt,updatedAt')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return data as Product;
  }

  async getProductByName(name: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Product')
      .select('id,name,description,price,categoryId,isAvailable,prepTimeMinutes,createdAt,updatedAt')
      .eq('name', name)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Producto con nombre ${name} no encontrado`);
    }

    return data as Product;
  }

  async createProduct(createProductDto: {
    name: string;
    categoryId: string;
    price: number;
    description?: string;
    prepTimeMinutes?: number;
    isAvailable?: boolean;
    code?: string;
    type?: 'COMIDA' | 'BEBIDA' | 'POSTRE' | 'COMBO' | 'ADICIONAL';
    image?: string;
    preparationTime?: number;
    isEnabled?: boolean;
    allergens?: string[];
    nutritionalInfo?: Record<string, any>;
  }) {
    try {
      console.log('🚀 INICIANDO CREACIÓN DE PRODUCTO');
      console.log('📋 Datos recibidos:', JSON.stringify(createProductDto, null, 2));

      // Verificar que la categoría existe
      console.log('🔍 Verificando que la categoría existe...');
      await this.getCategoryById(createProductDto.categoryId);
      console.log('✅ Categoría verificada correctamente');

      // Verificar que el nombre del producto no existe
      console.log('🔍 Verificando nombre único...');
      const { data: existingProduct, error: checkError } = await this.supabaseService.getClient()
        .from('Product')
        .select('id')
        .eq('name', createProductDto.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error verificando producto existente:', checkError);
        throw new HttpException(`Error checking existing product: ${checkError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (existingProduct) {
        console.error('❌ Producto con nombre duplicado encontrado:', existingProduct);
        throw new HttpException(`Ya existe un producto con el nombre ${createProductDto.name}`, HttpStatus.BAD_REQUEST);
      }
      console.log('✅ Nombre único verificado');

      console.log('📤 Enviando datos a RPC product_upsert...');
      console.log('📋 Datos a enviar:', {
        name: createProductDto.name,
        categoryId: createProductDto.categoryId,
        price: createProductDto.price
      });

      const { data: productId, error } = await this.supabaseService.getClient()
        .rpc('product_upsert', {
          p_name: createProductDto.name,
          p_price: createProductDto.price,
          p_category_id: createProductDto.categoryId,
          p_description: createProductDto.description ?? null,
          p_prep_time_minutes: createProductDto.prepTimeMinutes ?? 15,
          p_is_available: createProductDto.isAvailable ?? true
        });

      console.log('RPC response:', { productId, error });

      if (error) {
        console.error('❌ ERROR DETALLADO EN CREAR PRODUCTO:');
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        console.error('   - Error details:', error.details);
        console.error('   - Error hint:', error.hint);
        console.error('   - Error completo:', JSON.stringify(error, null, 2));
        console.error('   - Datos enviados:', JSON.stringify({
          p_code: createProductDto.code,
          p_name: createProductDto.name,
          p_price: createProductDto.price,
          p_category_id: createProductDto.categoryId,
          p_id: null,
          p_type: createProductDto.type ?? 'COMIDA',
          p_description: createProductDto.description ?? null,
          p_image: createProductDto.image ?? null,
          p_preparation_time: createProductDto.preparationTime ?? 15,
          p_is_enabled: createProductDto.isEnabled ?? true,
          p_is_available: createProductDto.isAvailable ?? true,
          p_allergens: createProductDto.allergens ?? null,
          p_nutritional_info: createProductDto.nutritionalInfo ?? null
        }, null, 2));
        throw new HttpException(`Error creating product: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el producto completo
      return await this.getProductById(productId);
    } catch (error) {
      console.error('❌ ERROR GENERAL EN CREAR PRODUCTO:');
      console.error('   - Error type:', typeof error);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      console.error('   - Error completo:', JSON.stringify(error, null, 2));
      
      if (error instanceof HttpException) {
        console.error('   - Es HttpException, re-lanzando...');
        throw error;
      }
      
      console.error('   - Error no es HttpException, convirtiendo...');
      throw new HttpException(`Error creating product: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateProduct(id: string, updateProductDto: {
    code?: string;
    name?: string;
    categoryId?: string;
    price?: number;
    type?: 'COMIDA' | 'BEBIDA' | 'POSTRE' | 'COMBO' | 'ADICIONAL';
    description?: string;
    image?: string;
    preparationTime?: number;
    isEnabled?: boolean;
    isAvailable?: boolean;
    allergens?: string[];
    nutritionalInfo?: Record<string, any>;
  }) {
    try {
      // Verificar que el producto existe
      await this.getProductById(id);

      const { data: productId, error } = await this.supabaseService.getClient()
        .rpc('product_upsert', {
          p_code: updateProductDto.code ?? '',
          p_name: updateProductDto.name ?? '',
          p_price: updateProductDto.price ?? 0,
          p_category_id: updateProductDto.categoryId ?? '',
          p_id: id,
          p_type: updateProductDto.type ?? 'COMIDA',
          p_description: updateProductDto.description ?? null,
          p_image: updateProductDto.image ?? null,
          p_preparation_time: updateProductDto.preparationTime ?? 15,
          p_is_enabled: updateProductDto.isEnabled ?? true,
          p_is_available: updateProductDto.isAvailable ?? true,
          p_allergens: updateProductDto.allergens ?? null,
          p_nutritional_info: updateProductDto.nutritionalInfo ?? null
        });

      if (error) {
        throw new HttpException(`Error updating product: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el producto actualizado
      return await this.getProductById(productId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating product: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);

    const { error } = await this.supabaseService.getClient()
      .from('Product')
      .delete()
      .eq('id', id);

    if (error) {
      throw new HttpException(`Error deleting product: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Producto eliminado exitosamente' };
  }

  // ========================================
  // ESPACIOS
  // ========================================

  async getSpaces() {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('id,name,type,capacity,status,isActive,notes,createdAt,updatedAt')
      .order('name', { ascending: true });

    if (error) {
      throw new HttpException(`Error getting spaces: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return data as Space[];
  }

  async getSpaceById(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('id,name,type,capacity,status,isActive,notes,createdAt,updatedAt')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    return data as Space;
  }

  async createSpace(createSpaceDto: {
    code: string;
    name: string;
    type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number;
    status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
    isActive?: boolean;
    notes?: string;
  }) {
    try {
      const { data: spaceId, error } = await this.supabaseService.getClient()
        .rpc('space_upsert', {
          p_code: createSpaceDto.code,
          p_name: createSpaceDto.name,
          p_type: createSpaceDto.type,
          p_id: null,
          p_capacity: createSpaceDto.capacity ?? 4,
          p_status: createSpaceDto.status ?? 'LIBRE',
          p_is_active: createSpaceDto.isActive ?? true,
          p_notes: createSpaceDto.notes ?? null
        });

      if (error) {
        console.error('❌ ERROR DETALLADO EN CREAR ESPACIO:');
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        console.error('   - Error details:', error.details);
        console.error('   - Error hint:', error.hint);
        console.error('   - Error completo:', JSON.stringify(error, null, 2));
        console.error('   - Datos enviados:', JSON.stringify({
          p_code: createSpaceDto.code,
          p_name: createSpaceDto.name,
          p_type: createSpaceDto.type,
          p_id: null,
          p_capacity: createSpaceDto.capacity ?? 4,
          p_status: createSpaceDto.status ?? 'LIBRE',
          p_is_active: createSpaceDto.isActive ?? true,
          p_notes: createSpaceDto.notes ?? null
        }, null, 2));
        throw new HttpException(`Error creating space: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el espacio completo
      return await this.getSpaceById(spaceId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error creating space: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSpace(id: string, updateSpaceDto: {
    code?: string;
    name?: string;
    type?: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number;
    status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
    isActive?: boolean;
    notes?: string;
  }) {
    try {
      // Verificar que el espacio existe
      await this.getSpaceById(id);

      const { data: spaceId, error } = await this.supabaseService.getClient()
        .rpc('space_upsert', {
          p_code: updateSpaceDto.code ?? '',
          p_name: updateSpaceDto.name ?? '',
          p_type: updateSpaceDto.type ?? 'MESA',
          p_id: id,
          p_capacity: updateSpaceDto.capacity ?? 4,
          p_status: updateSpaceDto.status ?? 'LIBRE',
          p_is_active: updateSpaceDto.isActive ?? true,
          p_notes: updateSpaceDto.notes ?? null
        });

      if (error) {
        throw new HttpException(`Error updating space: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el espacio actualizado
      return await this.getSpaceById(spaceId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating space: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteSpace(id: string) {
    await this.getSpaceById(id);

    const { error } = await this.supabaseService.getClient()
      .from('Space')
      .delete()
      .eq('id', id);

    if (error) {
      throw new HttpException(`Error deleting space: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Espacio eliminado exitosamente' };
  }

  // ==================== COMBO METHODS ====================

  async getCombos(): Promise<any[]> {
    console.log('🔍 CatalogService.getCombos() - Iniciando...');
    try {
      const supabase = this.supabaseService.getClient();
      
      const { data, error } = await supabase
        .from('Combo')
        .select(`
          id, name, description, "basePrice", image, "isEnabled", "isAvailable", "preparationTime", "maxSelections", "categoryId", "createdAt", "updatedAt",
          ComboComponent(id, name, description, type, price, "isRequired", "isAvailable", "maxSelections", ord)
        `)
        .eq('isEnabled', true)
        .order('name');

      console.log('📊 Query combos - Data:', data?.length ?? 0, 'Error:', error);

      if (error) {
        console.error('❌ getCombos supabase error:', error);
        throw new HttpException(`Error getting combos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      console.log('✅ getCombos exitoso - Combos:', data?.length);
      return data || [];
    } catch (e: any) {
      console.error('💥 Error en getCombos():', e);
      if (e instanceof HttpException) throw e;
      throw new HttpException(`Error getting combos: ${e?.message ?? e}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getComboById(id: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('Combo')
        .select(`
          id, name, description, "basePrice", image, "isEnabled", "isAvailable", "preparationTime", "maxSelections", "categoryId", "createdAt", "updatedAt",
          ComboComponent(id, name, description, type, price, "isRequired", "isAvailable", "maxSelections", ord)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new HttpException(`Combo not found: ${error.message}`, HttpStatus.NOT_FOUND);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error getting combo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createCombo(createComboDto: {
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
  }): Promise<any> {
    try {
      console.log('🚀 INICIANDO CREACIÓN DE COMBO');
      console.log('📋 Datos recibidos:', JSON.stringify(createComboDto, null, 2));

      // Verificar que la categoría existe
      console.log('🔍 Verificando que la categoría existe...');
      await this.getCategoryById(createComboDto.categoryId);
      console.log('✅ Categoría verificada correctamente');

      // Verificar que el código del combo no existe
      console.log('🔍 Verificando código único...');
      const { data: existingCombo, error: checkError } = await this.supabaseService.getClient()
        .from('Combo')
        .select('id')
        .eq('code', createComboDto.code)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error verificando combo existente:', checkError);
        throw new HttpException(`Error checking existing combo: ${checkError.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (existingCombo) {
        console.error('❌ Combo con código duplicado encontrado:', existingCombo);
        throw new HttpException(`Ya existe un combo con el código ${createComboDto.code}`, HttpStatus.BAD_REQUEST);
      }
      console.log('✅ Código único verificado');

      console.log('📤 Enviando datos a RPC combo_create_or_update_basic...');

      const { data: comboId, error } = await this.supabaseService.getClient()
        .rpc('combo_create_or_update_basic', {
          p_code: createComboDto.code,
          p_name: createComboDto.name,
          p_base_price: createComboDto.basePrice,
          p_category_id: createComboDto.categoryId,
          p_description: createComboDto.description || null,
          p_image: createComboDto.image || null,
          p_is_enabled: createComboDto.isEnabled ?? true,
          p_is_available: createComboDto.isAvailable ?? true,
          p_preparation_time: createComboDto.preparationTime || 20,
          p_platos_ids: [], // Por ahora vacío, se puede implementar después
          p_platos_max: createComboDto.maxSelections || 4,
          p_acomp_ids: [], // Por ahora vacío, se puede implementar después
          p_acomp_max: 2,
          p_id: null
        });

      console.log('RPC response:', { comboId, error });

      if (error) {
        console.error('❌ ERROR DETALLADO EN CREAR COMBO:');
        console.error('   - Error code:', error.code);
        console.error('   - Error message:', error.message);
        console.error('   - Error details:', error.details);
        console.error('   - Error hint:', error.hint);
        console.error('   - Error completo:', JSON.stringify(error, null, 2));
        throw new HttpException(`Error creating combo: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el combo completo
      return await this.getComboById(comboId);
    } catch (error) {
      console.error('❌ ERROR GENERAL EN CREAR COMBO:');
      console.error('   - Error type:', typeof error);
      console.error('   - Error message:', error.message);
      console.error('   - Error stack:', error.stack);
      
      if (error instanceof HttpException) {
        console.error('   - Es HttpException, re-lanzando...');
        throw error;
      }
      
      console.error('   - Error no es HttpException, convirtiendo...');
      throw new HttpException(`Error creating combo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCombo(id: string, updateComboDto: {
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
  }): Promise<any> {
    try {
      // Verificar que el combo existe
      await this.getComboById(id);

      const { data: comboId, error } = await this.supabaseService.getClient()
        .rpc('combo_create_or_update_with_components', {
          p_code: updateComboDto.code ?? '',
          p_name: updateComboDto.name ?? '',
          p_base_price: updateComboDto.basePrice ?? 0,
          p_category_id: updateComboDto.categoryId ?? '',
          p_description: updateComboDto.description ?? null,
          p_image: updateComboDto.image ?? null,
          p_is_enabled: updateComboDto.isEnabled ?? true,
          p_is_available: updateComboDto.isAvailable ?? true,
          p_preparation_time: updateComboDto.preparationTime || 20,
          p_max_selections: updateComboDto.maxSelections || 4,
          p_components: updateComboDto.components || null,
          p_id: id
        });

      if (error) {
        throw new HttpException(`Error updating combo: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      // Obtener el combo actualizado
      return await this.getComboById(comboId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error updating combo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCombo(id: string): Promise<void> {
    try {
      // Verificar que el combo existe
      await this.getComboById(id);

      const { error } = await this.supabaseService.getClient()
        .from('Combo')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(`Error deleting combo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error deleting combo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getProductsForComboComponents(categoryId?: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_products_for_combo_components', {
          p_category_id: categoryId || null
        });

      if (error) {
        throw new HttpException(`Error getting products for combo components: ${error.message}`, HttpStatus.BAD_REQUEST);
      }

      return data || [];
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error getting products for combo components: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
