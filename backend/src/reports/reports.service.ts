import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';
import { 
  PaymentMethodReport, 
  DeliveryPaymentReport, 
  OrderReport, 
  ReportsFilters 
} from './reports.controller';

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPaymentMethodsReport(
    fromDate?: Date,
    toDate?: Date
  ): Promise<PaymentMethodReport[]> {
    try {
      // Usar función RPC para filtros de fecha precisos
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_payment_methods_report_by_date', {
          p_from_date: fromDate?.toISOString().split('T')[0] || null,
          p_to_date: toDate?.toISOString().split('T')[0] || null
        });

      if (error) throw error;
      
      // Mapear los datos de la función RPC a la interfaz esperada
      const mappedData = (data || []).map(item => ({
        method: item.method,
        icon: item.icon,
        color: item.color,
        ordersCount: item.ordersCount,
        paidByMethod: item.paidByMethod || 0,
        originalTotal: item.originalTotal || 0,
        finalTotal: item.finalTotal || 0
      }));

      return mappedData;
    } catch (error) {
      console.error('Error getting payment methods report:', error);
      throw new Error('Error al obtener reporte de métodos de pago');
    }
  }

  async getDeliveryPaymentsReport(
    fromDate?: Date,
    toDate?: Date
  ): Promise<DeliveryPaymentReport[]> {
    try {
      // Usar función RPC para filtros de fecha precisos
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_delivery_payments_report_by_date', {
          p_from_date: fromDate?.toISOString().split('T')[0] || null,
          p_to_date: toDate?.toISOString().split('T')[0] || null
        });

      if (error) throw error;
      
      // Mapear los datos de la función RPC a la interfaz esperada
      const mappedData = (data || []).map(item => ({
        method: item.method,
        icon: item.icon,
        color: item.color,
        deliveryOrdersCount: item.deliveryOrdersCount || 0,
        deliveryFeesPaid: item.deliveryFeesPaid || 0,
        orderTotalsPaid: item.orderTotalsPaid || 0,
        totalPaid: item.totalPaid || 0
      }));

      return mappedData;
    } catch (error) {
      console.error('Error getting delivery payments report:', error);
      throw new Error('Error al obtener reporte de pagos de delivery');
    }
  }

  async getOrdersReport(filters: ReportsFilters): Promise<{
    orders: OrderReport[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      // Usar función RPC para filtros de fecha y otros filtros precisos
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_orders_report_by_date', {
          p_from_date: filters.from ? new Date(filters.from).toISOString().split('T')[0] : null,
          p_to_date: filters.to ? new Date(filters.to).toISOString().split('T')[0] : null,
          p_status: filters.status || null,
          p_space_type: filters.spaceType || null,
          p_limit: limit,
          p_offset: offset
        });

      if (error) throw error;

      // Obtener el total de la primera fila (si existe)
      const total = data && data.length > 0 ? data[0].total_count : 0;

      // Mapear los datos de la función RPC a la interfaz esperada
      const mappedOrders = (data || []).map(item => ({
        id: item.id,
        orderNumber: item.orderNumber,
        createdAt: item.createdAt,
        spaceCode: item.spaceCode,
        spaceName: item.spaceName,
        spaceType: item.spaceType,
        customerName: item.customerName,
        status: item.status,
        originalTotal: item.originalTotal || 0,
        finalTotal: item.finalTotal || 0,
        paidTotal: item.paidTotal || 0,
        deliveryFeeTotal: item.deliveryFeeTotal || 0,
        totalPaid: item.totalPaid || 0,
        payments: item.payments || []
      }));

      return {
        orders: mappedOrders,
        total: total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error getting orders report:', error);
      throw new Error('Error al obtener reporte de órdenes');
    }
  }

  async softDeleteOrder(
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('soft_delete_order', {
          p_order_id: orderId,
          p_reason: reason || 'Eliminado por administrador'
        });

      if (error) throw error;

      return {
        success: true,
        message: `Orden ${orderId} eliminada exitosamente`
      };
    } catch (error) {
      console.error('Error soft deleting order:', error);
      return {
        success: false,
        message: 'Error al eliminar la orden'
      };
    }
  }

  async exportOrdersReport(filters: ReportsFilters): Promise<{
    csv: string;
    filename: string;
  }> {
    try {
      // Obtener todos los datos sin paginación para exportar
      const allFilters = { ...filters, limit: 10000 };
      const { orders } = await this.getOrdersReport(allFilters);

      // Generar CSV
      const headers = [
        'Orden',
        'Fecha',
        'Espacio',
        'Cliente',
        'Estado',
        'Total Original',
        'Total Final',
        'Total Pagado',
        'Fee Delivery',
        'Métodos de Pago'
      ];

      const csvRows = [headers.join(',')];

      orders.forEach(order => {
        const payments = order.payments
          .map(p => `${p.method}: ${p.amount}`)
          .join('; ');

        const row = [
          order.orderNumber,
          order.createdAt.toISOString().split('T')[0],
          order.spaceCode,
          order.customerName || '',
          order.status,
          order.originalTotal,
          order.finalTotal,
          order.paidTotal,
          order.deliveryFeeTotal,
          `"${payments}"`
        ];

        csvRows.push(row.join(','));
      });

      const csv = csvRows.join('\n');
      const filename = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error exporting orders report:', error);
      throw new Error('Error al exportar reporte de órdenes');
    }
  }
}
