import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface PaymentMethodReport {
  method: string;
  icon: string;
  color: string;
  ordersCount: number;
  finalTotal: number;
  originalTotal: number;
  paidByMethod: number;
}

export interface DeliveryPaymentReport {
  method: string;
  icon: string;
  color: string;
  deliveryOrdersCount: number;
  deliveryFeesPaid: number;
  orderTotalsPaid: number;
  totalPaid: number;
}

export interface OrderReport {
  id: string;
  orderNumber: string;
  createdAt: Date;
  spaceCode: string;
  spaceName: string;
  spaceType: string;
  customerName: string;
  status: string;
  originalTotal: number;
  finalTotal: number;
  paidTotal: number;
  deliveryFeeTotal: number;
  totalPaid: number;
  payments: Array<{
    method: string;
    amount: number;
    baseAmount?: number;
    surchargeAmount?: number;
    isDelivery: boolean;
    paymentDate: Date;
  }>;
}

export interface ReportsFilters {
  from?: string;
  to?: string;
  status?: string;
  method?: string;
  spaceType?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // =====================================================
  // REPORTE DE MÉTODOS DE PAGO
  // =====================================================
  async getPaymentMethodsReport(
    fromDate?: Date,
    toDate?: Date
  ): Promise<PaymentMethodReport[]> {
    try {
      console.log('💳 ReportsService.getPaymentMethodsReport - Obteniendo reporte de métodos de pago:', {
        fromDate: fromDate?.toISOString().split('T')[0],
        toDate: toDate?.toISOString().split('T')[0]
      });

      // Usar función RPC optimizada
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_payment_methods_report_by_date', {
          p_from_date: fromDate ? fromDate.toISOString().split('T')[0] : null,
          p_to_date: toDate ? toDate.toISOString().split('T')[0] : null
        });

      if (error) {
        console.error('❌ Error en get_payment_methods_report_by_date:', error);
        throw error;
      }

      console.log('✅ Reporte de métodos de pago obtenido:', data?.length || 0, 'métodos');

      // Mapear datos de la función RPC
      const reports = (data || []).map((item: any) => ({
        method: item.method,
        icon: item.icon,
        color: item.color,
        ordersCount: parseInt(item.ordersCount) || 0,
        finalTotal: parseFloat(item.finalTotal) || 0,
        originalTotal: parseFloat(item.originalTotal) || 0,
        paidByMethod: parseFloat(item.paidByMethod) || 0
      }));

      return reports;
    } catch (error) {
      console.error('❌ Error en getPaymentMethodsReport:', error);
      throw error;
    }
  }

  // =====================================================
  // REPORTE DE DELIVERY
  // =====================================================
  async getDeliveryPaymentsReport(
    fromDate?: Date,
    toDate?: Date
  ): Promise<DeliveryPaymentReport[]> {
    try {
      console.log('🚚 ReportsService.getDeliveryPaymentsReport - Obteniendo reporte de delivery:', {
        fromDate: fromDate?.toISOString().split('T')[0],
        toDate: toDate?.toISOString().split('T')[0]
      });

      // Usar función RPC optimizada
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_delivery_payments_report_by_date', {
          p_from_date: fromDate ? fromDate.toISOString().split('T')[0] : null,
          p_to_date: toDate ? toDate.toISOString().split('T')[0] : null
        });

      if (error) {
        console.error('❌ Error en get_delivery_payments_report_by_date:', error);
        throw error;
      }

      console.log('✅ Reporte de delivery obtenido:', data?.length || 0, 'métodos');

      // Mapear datos de la función RPC
      const reports = (data || []).map((item: any) => ({
        method: item.method,
        icon: item.icon,
        color: item.color,
        deliveryOrdersCount: parseInt(item.deliveryOrdersCount) || 0,
        deliveryFeesPaid: parseFloat(item.deliveryFeesPaid) || 0,
        orderTotalsPaid: parseFloat(item.orderTotalsPaid) || 0,
        totalPaid: parseFloat(item.totalPaid) || 0
      }));

      return reports;
    } catch (error) {
      console.error('❌ Error en getDeliveryPaymentsReport:', error);
      throw error;
    }
  }

  // =====================================================
  // REPORTE DE ÓRDENES
  // =====================================================
  async getOrdersReport(filters: ReportsFilters): Promise<{
    orders: OrderReport[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;

      console.log('📋 ReportsService.getOrdersReport - Obteniendo reporte de órdenes:', {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        spaceType: filters.spaceType,
        page,
        limit
      });

      // Usar función RPC optimizada
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_orders_report_by_date', {
          p_from_date: filters.from ? new Date(filters.from).toISOString().split('T')[0] : null,
          p_to_date: filters.to ? new Date(filters.to).toISOString().split('T')[0] : null,
          p_status: filters.status || null,
          p_space_type: filters.spaceType || null,
          p_page: page,
          p_limit: limit
        });

      if (error) {
        console.error('❌ Error en get_orders_report_by_date:', error);
        throw error;
      }

      // La función RPC retorna { orders: JSONB, total: BIGINT }
      const result = data && data.length > 0 ? data[0] : { orders: [], total: 0 };
      const total = parseInt(result.total) || 0;
      const ordersData = result.orders || [];

      console.log('✅ Reporte de órdenes obtenido:', ordersData.length, 'órdenes de', total, 'total');

      // Mapear los datos de la función RPC a la interfaz esperada
      const mappedOrders = ordersData.map((item: any) => ({
        id: item.id,
        orderNumber: item.orderNumber,
        createdAt: new Date(item.createdAt),
        spaceCode: item.spaceCode,
        spaceName: item.spaceName,
        spaceType: item.spaceType,
        customerName: item.customerName,
        status: item.status,
        originalTotal: parseFloat(item.originalTotal) || 0,
        finalTotal: parseFloat(item.finalTotal) || 0,
        paidTotal: parseFloat(item.paidTotal) || 0,
        deliveryFeeTotal: parseFloat(item.deliveryFeeTotal) || 0,
        totalPaid: parseFloat(item.totalPaid) || 0,
        payments: (item.payments || []).map((payment: any) => ({
          method: payment.method,
          amount: parseFloat(payment.amount) || 0,
          baseAmount: payment.baseAmount ? parseFloat(payment.baseAmount) : undefined,
          surchargeAmount: payment.surchargeAmount ? parseFloat(payment.surchargeAmount) : undefined,
          isDelivery: Boolean(payment.isDelivery),
          paymentDate: new Date(payment.paymentDate)
        }))
      }));

      return {
        orders: mappedOrders,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('❌ Error en getOrdersReport:', error);
      throw error;
    }
  }

  // =====================================================
  // ELIMINACIÓN SUAVE DE ÓRDENES
  // =====================================================
  async softDeleteOrder(
    orderId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ ReportsService.softDeleteOrder - Eliminando orden:', orderId);

      const { error } = await this.supabaseService
        .getClient()
        .from('Order')
        .update({
          deletedAt: new Date().toISOString(),
          deletedReason: reason || 'Eliminado por administrador'
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error eliminando orden:', error);
        throw error;
      }

      console.log('✅ Orden eliminada correctamente:', orderId);
      return {
        success: true,
        message: 'Orden eliminada correctamente'
      };
    } catch (error) {
      console.error('❌ Error en softDeleteOrder:', error);
      return {
        success: false,
        message: `Error eliminando orden: ${error.message}`
      };
    }
  }

  // =====================================================
  // EXPORTACIÓN DE REPORTES
  // =====================================================
  async exportOrdersReport(filters: ReportsFilters): Promise<{ csv: string; filename: string }> {
    try {
      console.log('📤 ReportsService.exportOrdersReport - Exportando reporte de órdenes');

      // Obtener todas las órdenes sin paginación para exportar
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_orders_report_by_date', {
          p_from_date: filters.from ? new Date(filters.from).toISOString().split('T')[0] : null,
          p_to_date: filters.to ? new Date(filters.to).toISOString().split('T')[0] : null,
          p_status: filters.status || null,
          p_space_type: filters.spaceType || null,
          p_page: 1,
          p_limit: 10000 // Límite alto para exportar todo
        });

      if (error) {
        console.error('❌ Error en exportOrdersReport:', error);
        throw error;
      }

      const result = data && data.length > 0 ? data[0] : { orders: [], total: 0 };
      const ordersData = result.orders || [];

      // Generar CSV
      const headers = [
        'Número de Orden',
        'Fecha',
        'Cliente',
        'Espacio',
        'Tipo de Espacio',
        'Estado',
        'Total Original',
        'Total Final',
        'Total Pagado',
        'Métodos de Pago'
      ];

      const csvRows = [headers.join(',')];

      ordersData.forEach((order: any) => {
        const paymentMethods = (order.payments || [])
          .map((p: any) => `${p.method}: S/${p.amount}`)
          .join('; ');

        const row = [
          `"${order.orderNumber}"`,
          `"${new Date(order.createdAt).toLocaleDateString()}"`,
          `"${order.customerName}"`,
          `"${order.spaceCode}"`,
          `"${order.spaceType}"`,
          `"${order.status}"`,
          `"${order.originalTotal}"`,
          `"${order.finalTotal}"`,
          `"${order.totalPaid}"`,
          `"${paymentMethods}"`
        ];
        csvRows.push(row.join(','));
      });

      const csv = csvRows.join('\n');
      const filename = `reporte_ordenes_${new Date().toISOString().split('T')[0]}.csv`;

      console.log('✅ Reporte exportado:', filename, 'con', ordersData.length, 'órdenes');

      return { csv, filename };
    } catch (error) {
      console.error('❌ Error en exportOrdersReport:', error);
      throw error;
    }
  }
}