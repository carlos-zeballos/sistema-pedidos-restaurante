import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

@Injectable()
export class SimpleReportsService {
  constructor(private readonly supabase: SupabaseService) {}

  // Obtener órdenes activas simplificadas para mozos
  async getActiveOrdersForWaiters() {
    const { data, error } = await this.supabase.client.rpc('get_active_orders_for_waiters');
    
    if (error) {
      console.error('Error getting active orders for waiters:', error);
      throw new Error(`Error al obtener órdenes activas: ${error.message}`);
    }

    return data || [];
  }

  // Obtener productos disponibles
  async getAvailableProducts() {
    const { data, error } = await this.supabase.client
      .from('Product')
      .select('id, name, price, isAvailable')
      .eq('isAvailable', true)
      .order('name');

    if (error) {
      console.error('Error getting products:', error);
      throw new Error(`Error al obtener productos: ${error.message}`);
    }

    return data || [];
  }

  // Obtener espacios disponibles
  async getAvailableSpaces() {
    const { data, error } = await this.supabase.client
      .from('Space')
      .select('id, name, type, isActive')
      .eq('isActive', true)
      .order('name');

    if (error) {
      console.error('Error getting spaces:', error);
      throw new Error(`Error al obtener espacios: ${error.message}`);
    }

    return data || [];
  }

  // Crear orden simplificada
  async createSimpleOrder(orderData: {
    spaceId: string;
    customerName: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const { data, error } = await this.supabase.client.rpc('create_simple_order', {
      p_space_id: orderData.spaceId,
      p_customer_name: orderData.customerName,
      p_items: orderData.items
    });

    if (error) {
      console.error('Error creating simple order:', error);
      throw new Error(`Error al crear orden: ${error.message}`);
    }

    return data;
  }

  // Actualizar estado de orden
  async updateOrderStatusSimple(orderId: string, status: string) {
    const { data, error } = await this.supabase.client
      .from('Order')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }

    return data;
  }
}
