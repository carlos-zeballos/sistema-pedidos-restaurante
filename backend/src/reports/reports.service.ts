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

  // Helper methods para iconos y colores de métodos de pago
  private getPaymentMethodIcon(method: string): string {
    const iconMap: { [key: string]: string } = {
      'Efectivo': '💰',
      'Yape': '📱',
      'Plin': '📱',
      'Transferencia': '🏦',
      'Tarjeta': '💳',
      'Billetera Digital': '📲',
      'Sin Pago': '❌'
    };
    return iconMap[method] || '💳';
  }

  private getPaymentMethodColor(method: string): string {
    const colorMap: { [key: string]: string } = {
      'Efectivo': '#10B981',
      'Yape': '#8B5CF6',
      'Plin': '#F59E0B',
      'Transferencia': '#3B82F6',
      'Tarjeta': '#EF4444',
      'Billetera Digital': '#06B6D4',
      'Sin Pago': '#EF4444'
    };
    return colorMap[method] || '#6B7280';
  }

  async getPaymentMethodsReport(
    fromDate?: Date,
    toDate?: Date
  ): Promise<PaymentMethodReport[]> {
    try {
      // CORRECCIÓN: Usar la misma fuente de datos que Ventas Totales para consistencia
      const { orders } = await this.getOrdersReport({
        from: fromDate?.toISOString().split('T')[0],
        to: toDate?.toISOString().split('T')[0],
        limit: 10000 // Obtener todas las órdenes para el reporte
      });

      // Generar reporte de métodos de pago desde los datos unificados
      const methodMap = new Map<string, {
        method: string;
        icon: string;
        color: string;
        ordersCount: Set<string>;
        finalTotal: number;
      }>();

      orders.forEach(order => {
        // CORRECCIÓN: Incluir TODAS las órdenes, incluso sin pagos registrados
        let method = 'Sin Pago';
        let amount = 0;

        if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
          // Solo considerar pagos base (no delivery)
          const basePayments = order.payments.filter((payment: any) => !payment.isDelivery);
          
          if (basePayments.length > 0) {
            // Tomar solo el pago más reciente (misma lógica que Ventas Totales)
            const sortedPayments = basePayments
              .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
            const latestPayment = sortedPayments[0];

            if (latestPayment) {
              method = latestPayment.method;
              amount = latestPayment.amount;
            }
          }
        }

        // Si no hay pagos, usar el total de la orden como "Sin Pago"
        if (method === 'Sin Pago') {
          amount = order.finalTotal;
        }

        if (!methodMap.has(method)) {
          methodMap.set(method, {
            method,
            icon: this.getPaymentMethodIcon(method),
            color: this.getPaymentMethodColor(method),
            ordersCount: new Set(),
            finalTotal: 0
          });
        }

        const methodData = methodMap.get(method);
        if (!methodData) return;
        methodData.ordersCount.add(order.id);
        methodData.finalTotal += amount;
      });

      return Array.from(methodMap.values()).map(method => ({
        method: method.method,
        icon: method.icon,
        color: method.color,
        ordersCount: method.ordersCount.size,
        paidByMethod: method.finalTotal, // Alias para compatibilidad
        originalTotal: method.finalTotal, // Alias para compatibilidad
        finalTotal: method.finalTotal
      }));
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
      // CORRECCIÓN: Usar la misma fuente de datos que Ventas Totales para consistencia
      const { orders } = await this.getOrdersReport({
        from: fromDate?.toISOString().split('T')[0],
        to: toDate?.toISOString().split('T')[0],
        limit: 10000 // Obtener todas las órdenes para el reporte
      });

      // Generar reporte de delivery desde los datos unificados
      const methodMap = new Map<string, {
        method: string;
        icon: string;
        color: string;
        deliveryOrdersCount: Set<string>;
        finalTotal: number;
      }>();

      // Solo considerar órdenes de delivery
      const deliveryOrders = orders.filter(order => order.spaceType === 'DELIVERY');
      
      deliveryOrders.forEach(order => {
        // CORRECCIÓN: Incluir TODAS las órdenes de delivery, incluso sin pagos registrados
        let method = 'Sin Pago';
        let amount = 0;

        if (order.payments && Array.isArray(order.payments) && order.payments.length > 0) {
          // Solo considerar pagos de delivery
          const deliveryPayments = order.payments.filter((payment: any) => payment.isDelivery);
          
          if (deliveryPayments.length > 0) {
            // Tomar solo el pago de delivery más reciente (misma lógica que Ventas Totales)
            const sortedDeliveryPayments = deliveryPayments
              .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
            const latestDeliveryPayment = sortedDeliveryPayments[0];

            if (latestDeliveryPayment) {
              method = latestDeliveryPayment.method;
              amount = (latestDeliveryPayment as any).surchargeAmount || latestDeliveryPayment.amount;
            }
          }
        }

        // Si no hay pagos de delivery, usar el deliveryFeeTotal de la orden
        if (method === 'Sin Pago') {
          amount = order.deliveryFeeTotal || 0;
        }
        
        if (!methodMap.has(method)) {
          methodMap.set(method, {
            method,
            icon: this.getPaymentMethodIcon(method),
            color: this.getPaymentMethodColor(method),
            deliveryOrdersCount: new Set(),
            finalTotal: 0
          });
        }

        const methodData = methodMap.get(method);
        if (!methodData) return;
        methodData.deliveryOrdersCount.add(order.id);
        methodData.finalTotal += amount;
      });

      return Array.from(methodMap.values()).map(method => ({
        method: method.method,
        icon: method.icon,
        color: method.color,
        deliveryOrdersCount: method.deliveryOrdersCount.size,
        deliveryFeesPaid: method.finalTotal, // Alias para compatibilidad
        orderTotalsPaid: method.finalTotal, // Alias para compatibilidad
        totalPaid: method.finalTotal, // Alias para compatibilidad
        finalTotal: method.finalTotal
      }));
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

      // Usar función RPC para filtros de fecha y otros filtros precisos
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

      if (error) throw error;

      // La función RPC retorna { orders: JSONB, total: BIGINT }
      const result = data && data.length > 0 ? data[0] : { orders: [], total: 0 };
      const total = result.total || 0;
      const ordersData = result.orders || [];

      // Mapear los datos de la función RPC a la interfaz esperada
      const mappedOrders = ordersData.map((item: any) => {
        // CORRECCIÓN: Calcular paidTotal correctamente desde los pagos
        let correctPaidTotal = 0;
        if (item.payments && Array.isArray(item.payments)) {
          // Solo sumar el monto del pago más reciente (no todos los pagos)
          const latestPayment = item.payments
            .sort((a: any, b: any) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
          if (latestPayment) {
            correctPaidTotal = latestPayment.amount || 0;
          }
        }

        return {
          id: item.id,
          orderNumber: item.orderNumber,
          createdAt: new Date(item.createdAt),
          spaceCode: item.spaceCode,
          spaceName: item.spaceName,
          spaceType: item.spaceType,
          customerName: item.customerName,
          status: item.status,
          originalTotal: item.originalTotal || 0,
          finalTotal: item.finalTotal || 0,
          paidTotal: correctPaidTotal, // ✅ CORREGIDO: Solo el pago más reciente
          deliveryFeeTotal: item.deliveryFeeTotal || 0,
          totalPaid: item.totalPaid || 0,
          payments: item.payments || []
        };
      });

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
