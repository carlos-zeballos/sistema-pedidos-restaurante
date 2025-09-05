import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface Space {
  id: string;
  code: string;
  name: string;
  type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
  capacity?: number;
  status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TablesService {
  constructor(private supabaseService: SupabaseService) {}

  async getAllTables() {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('isActive', true)
      .order('code', { ascending: true });

    if (error) {
      throw new Error(`Error getting tables: ${error.message}`);
    }

    return data as Space[];
  }

  async getTableById(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    return data as Space;
  }

  async getTableByCode(code: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Espacio con código ${code} no encontrado`);
    }

    return data as Space;
  }

  async createTable(createTableDto: { 
    code: string; 
    name: string;
    type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number; 
    isActive?: boolean;
  }) {
    // Verificar que el código de espacio no exista
    const { data: existingTable, error: checkError } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('code', createTableDto.code)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Error checking existing table: ${checkError.message}`);
    }

    if (existingTable) {
      throw new Error(`Ya existe un espacio con el código ${createTableDto.code}`);
    }

    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .insert([{
        code: createTableDto.code,
        name: createTableDto.name,
        type: createTableDto.type,
        capacity: createTableDto.capacity || 4,
        status: 'LIBRE',
        isActive: createTableDto.isActive ?? true
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating table: ${error.message}`);
    }

    return data as Space;
  }

  async updateTable(id: string, updateTableDto: { 
    code?: string; 
    name?: string;
    type?: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number; 
    isActive?: boolean;
    status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  }) {
    await this.getTableById(id);

    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .update(updateTableDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating table: ${error.message}`);
    }

    return data as Space;
  }

  async updateTableStatus(id: string, status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO') {
    await this.getTableById(id);

    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating table status: ${error.message}`);
    }

    return data as Space;
  }

  async deleteTable(id: string) {
    await this.getTableById(id);

    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .update({ isActive: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error deleting table: ${error.message}`);
    }

    return data as Space;
  }

  async getTableStatus(id: string) {
    const table = await this.getTableById(id);
    
    // Buscar órdenes activas para este espacio
    const { data: activeOrders, error: ordersError } = await this.supabaseService.getClient()
      .from('Order')
      .select('*')
      .eq('spaceId', id)
      .in('status', ['PENDIENTE', 'EN_PREPARACION', 'LISTO']);

    if (ordersError) {
      throw new Error(`Error getting active orders: ${ordersError.message}`);
    }

    return {
      table,
      hasActiveOrders: activeOrders && activeOrders.length > 0,
      activeOrdersCount: activeOrders ? activeOrders.length : 0
    };
  }

  // Métodos para espacios (nueva funcionalidad)
  async getSpaces() {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('isActive', true)
      .order('type', { ascending: true })
      .order('code', { ascending: true });

    if (error) {
      throw new Error(`Error getting spaces: ${error.message}`);
    }

    return data as Space[];
  }

  async getSpaceById(id: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    return data as Space;
  }

  async updateSpaceStatus(id: string, status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO') {
    await this.getSpaceById(id);

    const { data, error } = await this.supabaseService.getClient()
      .from('Space')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating space status: ${error.message}`);
    }

    return data as Space;
  }
}
