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
      let query = this.supabaseService
        .getClient()
        .from('PaymentSummaryView')
        .select('*');

      if (fromDate && toDate) {
        // Aplicar filtros de fecha si es necesario
        // Nota: Las vistas ya filtran por deletedAt, pero podríamos agregar filtros de fecha aquí
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
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
      let query = this.supabaseService
        .getClient()
        .from('DeliveryPaymentSummaryView')
        .select('*');

      if (fromDate && toDate) {
        // Aplicar filtros de fecha si es necesario
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
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

      let query = this.supabaseService
        .getClient()
        .from('OrdersReportView')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.from) {
        query = query.gte('createdAt', filters.from);
      }
      if (filters.to) {
        query = query.lte('createdAt', filters.to);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.spaceType) {
        query = query.eq('spaceType', filters.spaceType);
      }

      // Aplicar paginación
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        orders: data || [],
        total: count || 0,
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
