import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface Order {
  id: string;
  orderNumber: string;
  spaceId: string;
  createdBy: string;
  assignedTo?: string;
  customerName?: string;
  customerPhone?: string;
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
  totalAmount: number;
  subtotal: number;
  tax: number;
  discount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  comboId?: string;
  name: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  status: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrders(status?: string) {
    // Solo obtener órdenes del día actual para evitar mostrar órdenes pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    let query = this.supabaseService
      .getClient()
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .gte('createdAt', todayISO) // Solo órdenes creadas hoy
      .order('createdAt', { ascending: false });

    if (status && status !== 'ALL') {
      const list = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length > 1) {
        query = query.in('status', list);
      } else if (list.length === 1) {
        query = query.eq('status', list[0]);
      }
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error getting orders: ${error.message}`);
    }
    return data as Order[];
  }

  async getKitchenOrders() {
    console.log('🔍 Obteniendo órdenes de cocina...');
    
    // Solo obtener órdenes del día actual para evitar mostrar órdenes pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const { data, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .select(`
        *,
        items:OrderItem(
          *,
          components:OrderItemComponent(*)
        ),
        space:Space(*)
      `)
      .in('status', ['PENDIENTE', 'EN_PREPARACION'])
      .gte('createdAt', todayISO) // Solo órdenes creadas hoy
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo órdenes de cocina:', error);
      throw new Error(`Error getting kitchen orders: ${error.message}`);
    }
    
    console.log('✅ Órdenes de cocina obtenidas (solo del día actual):', data);
    return data as Order[];
  }

  async getOrderById(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }
    return data as Order;
  }

  async createOrder(createOrderDto: {
    spaceId: string;
    createdBy: string;
    customerName?: string;
    customerPhone?: string;
    items: any[];
    notes?: string;
    totalAmount?: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    deliveryCost?: number;
    isDelivery?: boolean;
  }) {
    // Crear orden + items vía RPC atómico en la BD
    const rpcPayload = {
      p_space_id: createOrderDto.spaceId,
      p_created_by: createOrderDto.createdBy,
      p_customer_name: createOrderDto.customerName ?? null,
      p_customer_phone: createOrderDto.customerPhone ?? null,
      p_total_amount: createOrderDto.totalAmount ?? 0,
      p_subtotal: createOrderDto.subtotal ?? 0,
      p_tax: createOrderDto.tax ?? 0,
      p_discount: createOrderDto.discount ?? 0,
      p_notes: createOrderDto.notes ?? null,
      p_items: (createOrderDto.items ?? []).map((it) => ({
        productId: it.productId ?? it.productid ?? null,
        comboId: it.comboId ?? it.comboid ?? null,
        name: it.name,
        unitPrice: it.unitPrice ?? it.unitprice ?? 0,
        totalPrice: it.totalPrice ?? it.totalprice ?? 0,
        quantity: it.quantity ?? 1,
        notes: it.notes ?? null,
      })),
      p_delivery_cost: createOrderDto.deliveryCost ?? 0,
      p_is_delivery: createOrderDto.isDelivery ?? false,
    } as any;

    const { data: rpcData, error: rpcError } = await this.supabaseService
      .getClient()
      .rpc('create_order_with_items', rpcPayload);

    if (rpcError) {
      throw new Error(`Error creating order via RPC: ${rpcError.message}`);
    }

    const created = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    const { data: order, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .select('*')
      .eq('id', created.id)
      .single();
    if (error) {
      throw new Error(`Error fetching order after RPC: ${error.message}`);
    }
    return order as Order;
  }

  async updateOrderStatus(
    id: string,
    status:
      | 'PENDIENTE'
      | 'EN_PREPARACION'
      | 'LISTO'
      | 'ENTREGADO'
      | 'PAGADO'
      | 'CANCELADO',
    assignedTo?: string,
  ) {
    const order = await this.getOrderById(id);

    // Crear entrada en el historial
    const { error: historyError } = await this.supabaseService
      .getClient()
      .from('OrderStatusHistory')
      .insert([
        {
          orderId: id,
          status,
          changedBy: assignedTo || order.createdBy,
          notes: `Estado cambiado a ${status}`,
        },
      ]);
    if (historyError) {
      console.warn(
        'Warning: Could not create status history entry:',
        historyError.message,
      );
    }

    // Actualizar la orden
    const { data, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .update({
        status,
        assignedTo,
        actualReadyTime: status === 'LISTO' ? new Date() : undefined,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }

    // Si la orden se marca como PAGADA, liberar la mesa
    if (status === 'PAGADO') {
      await this.supabaseService
        .getClient()
        .from('Space')
        .update({ status: 'LIBRE' })
        .eq('id', order.spaceId);
    }

    return data as Order;
  }

  async updateOrderPaymentMethods(orderId: string, orderPaymentMethodId: string, deliveryPaymentMethodId?: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('update_order_payment_methods', {
        p_order_id: orderId,
        p_order_payment_method_id: orderPaymentMethodId,
        p_delivery_payment_method_id: deliveryPaymentMethodId || null
      });

    if (error) {
      throw new Error(`Error updating order payment methods: ${error.message}`);
    }

    return data;
  }

  async removeItemFromOrder(orderId: string, itemId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .delete()
      .eq('id', itemId)
      .eq('orderId', orderId);

    if (error) {
      throw new Error(`Error removing item from order: ${error.message}`);
    }

    return data;
  }

  async modifyItemInOrder(orderId: string, itemId: string, modifications: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .update({
        quantity: modifications.quantity,
        notes: modifications.notes,
        totalPrice: modifications.quantity * (modifications.unitPrice || 0),
        updatedAt: new Date().toISOString()
      })
      .eq('id', itemId)
      .eq('orderId', orderId);

    if (error) {
      throw new Error(`Error modifying item in order: ${error.message}`);
    }

    return data;
  }

  async getOrdersBySpace(spaceId: string) {
    // Solo obtener órdenes del día actual para evitar mostrar órdenes pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    
    const { data, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .select('*')
      .eq('spaceId', spaceId)
      .gte('createdAt', todayISO) // Solo órdenes creadas hoy
      .order('createdAt', { ascending: false });
    if (error) {
      throw new Error(`Error getting orders by space: ${error.message}`);
    }
    return data as Order[];
  }

  async updateOrder(
    id: string,
    dto: {
      spaceId?: string;
      customerName?: string;
      customerPhone?: string;
      notes?: string;
      totalAmount?: number;
      subtotal?: number;
      tax?: number;
      discount?: number;
      assignedTo?: string;
    },
  ) {
    // ensure exists
    await this.getOrderById(id);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('Order')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
    return data as Order;
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      console.log(`🗑️ Eliminando pedido: ${id}`);
      
      // Verificar que el pedido existe
      const order = await this.supabaseService
        .getClient()
        .from('Order')
        .select('*')
        .eq('id', id)
        .single();

      if (!order) {
        throw new Error(`Pedido con ID ${id} no encontrado`);
      }

      // Eliminar físicamente el pedido
      const { error } = await this.supabaseService
        .getClient()
        .from('Order')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando pedido:', error);
        throw new Error(`Error al eliminar pedido: ${error.message}`);
      }

      console.log(`✅ Pedido ${id} eliminado exitosamente`);
    } catch (error) {
      console.error('Error en deleteOrder:', error);
      throw error;
    }
  }

  async addOrderItems(
    orderId: string,
    items: Array<{
      productId?: string | null;
      comboId?: string | null;
      name: string;
      unitPrice: number;
      totalPrice: number;
      quantity?: number;
      notes?: string | null;
    }>,
  ) {
    console.log('🚀 addOrderItems iniciado:', { orderId, itemsCount: items.length });
    
    try {
      // ensure order exists
      const order = await this.getOrderById(orderId);
      console.log('✅ Orden encontrada:', { orderId: order.id, status: order.status, totalAmount: order.totalAmount });

    const rows = items.map((it) => ({
      orderid: orderId,
      productid: it.productId ?? null,
      comboid: it.comboId ?? null,
      name: it.name,
      unitprice: it.unitPrice,
      totalprice: it.totalPrice,
      quantity: it.quantity ?? 1,
      status: 'PENDIENTE',
      notes: it.notes ?? null,
      createdat: new Date().toISOString(), // Timestamp de creación (ya incluye 'Z')
    }));

      console.log('📝 Preparando items para insertar:', rows);
      
      const { data, error } = await this.supabaseService
        .getClient()
        .from('OrderItem')
        .insert(rows)
        .select();
      if (error) {
        console.error('❌ Error insertando items:', error);
        throw new Error(`Error adding items: ${error.message}`);
      }
      
      console.log('✅ Items insertados exitosamente:', data);

    // Calcular el total de los nuevos items
    const newItemsTotal = items.reduce((sum, item) => sum + (item.totalPrice * (item.quantity || 1)), 0);
    
    // Actualizar el total de la orden
    const updatedTotalAmount = order.totalAmount + newItemsTotal;
    const updatedSubtotal = order.subtotal + newItemsTotal;

    // Actualizar la orden con el nuevo total y timestamp
    const { error: updateError } = await this.supabaseService
      .getClient()
      .from('Order')
      .update({
        totalAmount: updatedTotalAmount,
        subtotal: updatedSubtotal,
        updatedAt: new Date().toISOString(), // Timestamp de actualización (ya incluye 'Z')
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('❌ Error actualizando orden:', updateError);
      throw new Error(`Error updating order: ${updateError.message}`);
    }

    // Cambiar el estado de la orden a EN_PREPARACION si no está en PENDIENTE
    let newStatus = order.status;
    if (order.status !== 'PENDIENTE') {
      newStatus = 'EN_PREPARACION';
    }

    // Actualizar la orden con el nuevo total y estado
    const { error: statusUpdateError } = await this.supabaseService
      .getClient()
      .from('Order')
      .update({
        totalAmount: updatedTotalAmount,
        subtotal: updatedSubtotal,
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId);

    if (statusUpdateError) {
      console.error('Error updating order totals and status:', statusUpdateError);
      // No lanzar error aquí, los items ya se agregaron
    }

      console.log(`✅ Items agregados a orden ${orderId}:`, {
        itemsAdded: data.length,
        newTotal: updatedTotalAmount,
        newStatus: newStatus
      });

      return data as OrderItem[];
    } catch (error) {
      console.error('💥 Error en addOrderItems:', error);
      throw error;
    }
  }

  async updateOrderItem(
    orderId: string,
    itemId: string,
    dto: Partial<{
      productId?: string | null;
      comboId?: string | null;
      name: string;
      unitPrice: number;
      totalPrice: number;
      quantity: number;
      status: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO';
      notes?: string | null;
    }>,
  ) {
    // sanity: item belongs to order
    const { data: item, error: itemErr } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .select('id, orderId')
      .eq('id', itemId)
      .single();
    if (itemErr || !item || item.orderId !== orderId) {
      throw new NotFoundException(
        `Item ${itemId} no pertenece a la orden ${orderId}`,
      );
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .update(dto)
      .eq('id', itemId)
      .select()
      .single();
    if (error) {
      throw new Error(`Error updating item: ${error.message}`);
    }
    return data as OrderItem;
  }

  async deleteOrderItem(orderId: string, itemId: string) {
    // sanity
    const { data: item, error: itemErr } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .select('id, orderId')
      .eq('id', itemId)
      .single();
    if (itemErr || !item || item.orderId !== orderId) {
      throw new NotFoundException(
        `Item ${itemId} no pertenece a la orden ${orderId}`,
      );
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('OrderItem')
      .delete()
      .eq('id', itemId)
      .select()
      .single();
    if (error) {
      throw new Error(`Error deleting item: ${error.message}`);
    }
    return data as OrderItem;
  }
}
