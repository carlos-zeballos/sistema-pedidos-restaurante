import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

@Injectable()
export class SimpleReportsService {
  constructor(private readonly supabase: SupabaseService) {}

  // Obtener órdenes activas simplificadas para mozos
  async getActiveOrdersForWaiters() {
    const { data, error } = await this.supabase.getClient().rpc('get_active_orders_for_waiters');
    
    if (error) {
      console.error('Error getting active orders for waiters:', error);
      throw new Error(`Error al obtener órdenes activas: ${error.message}`);
    }

    return data || [];
  }

  // Obtener productos disponibles
  async getAvailableProducts() {
    const { data, error } = await this.supabase.getClient()
      .from('Product')
      .select('id, name, price, "isAvailable"')
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
    const { data, error } = await this.supabase.getClient()
      .from('Space')
      .select('id, name, type, "isActive"')
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
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const orderPayload = {
      orderNumber,
      customerName: orderData.customerName,
      spaceId: orderData.spaceId,
      notes: null
    };

    const itemsPayload = orderData.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      notes: null
    }));

    const { data, error } = await this.supabase.getClient().rpc('create_simple_order', {
      order_data: orderPayload,
      items_data: itemsPayload
    });

    if (error) {
      console.error('Error creating simple order:', error);
      throw new Error(`Error al crear orden: ${error.message}`);
    }

    return data;
  }

  // Actualizar estado de orden
  async updateOrderStatusSimple(orderId: string, status: string) {
    const { data, error } = await this.supabase.getClient()
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
