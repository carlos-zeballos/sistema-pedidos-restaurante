import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';
import { 
  PaymentMethod, 
  OrderPayment, 
  PaymentRequest, 
  CashReport, 
  PaidOrderReport, 
  SalesByHour, 
  TodaySummary,
  PaymentSummary 
} from '../types/payment.types';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Obtener todos los métodos de pago activos
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('PaymentMethod')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw new Error('Error al obtener métodos de pago');
    }
  }

  // Registrar un pago
  async registerPayment(paymentRequest: PaymentRequest, waiterId?: string): Promise<OrderPayment> {
    try {
      const paymentData = {
        orderId: paymentRequest.orderId,
        paymentMethodId: paymentRequest.paymentMethodId,
        amount: paymentRequest.amount,
        notes: paymentRequest.notes,
        waiterId: waiterId,
        paymentDate: new Date().toISOString()
      };

      // Registrar el pago
      const { data, error } = await this.supabaseService
        .getClient()
        .from('OrderPayment')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      // IMPORTANTE: Actualizar el totalAmount de la orden con el monto modificado
      // Esto asegura que los reportes muestren el precio final pagado
      const { error: updateError } = await this.supabaseService
        .getClient()
        .from('Order')
        .update({ 
          totalAmount: paymentRequest.amount,
          subtotal: paymentRequest.amount 
        })
        .eq('id', paymentRequest.orderId);

      if (updateError) {
        console.error('Error updating order totalAmount:', updateError);
        // No lanzar error aquí para no afectar el registro del pago
      } else {
        console.log(`✅ Orden ${paymentRequest.orderId} actualizada con totalAmount: ${paymentRequest.amount}`);
      }

      return data;
    } catch (error) {
      console.error('Error registering payment:', error);
      throw new Error('Error al registrar el pago');
    }
  }

  // Obtener reporte de caja por fecha
  async getCashReportByDate(startDate: Date, endDate: Date): Promise<CashReport[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_cash_report_by_date', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting cash report:', error);
      throw new Error('Error al obtener reporte de caja');
    }
  }

  // Obtener reporte de órdenes pagadas
  async getPaidOrdersReport(startDate: Date, endDate: Date): Promise<PaidOrderReport[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_paid_orders_report', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting paid orders report:', error);
      throw new Error('Error al obtener reporte de órdenes pagadas');
    }
  }

  // Obtener estadísticas de ventas por hora
  async getSalesByHour(date: Date): Promise<SalesByHour[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_sales_by_hour', {
          p_date: date.toISOString().split('T')[0]
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sales by hour:', error);
      throw new Error('Error al obtener estadísticas por hora');
    }
  }

  // Obtener resumen del día actual
  async getTodaySummary(): Promise<TodaySummary> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('get_today_summary');

      if (error) throw error;
      return data?.[0] || { total_orders: 0, total_amount: 0, payment_methods: [] };
    } catch (error) {
      console.error('Error getting today summary:', error);
      throw new Error('Error al obtener resumen del día');
    }
  }

  // Obtener resumen de métodos de pago
  async getPaymentSummary(): Promise<PaymentSummary[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('v_payment_summary')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payment summary:', error);
      throw new Error('Error al obtener resumen de pagos');
    }
  }

  // Obtener pagos de una orden específica
  async getOrderPayments(orderId: string): Promise<OrderPayment[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('OrderPayment')
        .select(`
          *,
          PaymentMethod (
            name,
            icon,
            color
          )
        `)
        .eq('orderId', orderId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw new Error('Error al obtener pagos de la orden');
    }
  }

  // Verificar si una orden ya está pagada
  async isOrderPaid(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('Order')
        .select('paymentStatus')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data?.paymentStatus === 'PAGADO';
    } catch (error) {
      console.error('Error checking if order is paid:', error);
      return false;
    }
  }

  // Obtener total de ventas por rango de fechas
  async getTotalSalesByDateRange(startDate: Date, endDate: Date): Promise<number> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('OrderPayment')
        .select('amount')
        .gte('paymentDate', startDate.toISOString())
        .lte('paymentDate', endDate.toISOString());

      if (error) throw error;
      return data?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting total sales:', error);
      return 0;
    }
  }

  // Registrar pago de delivery específico
  async registerDeliveryPayment(
    orderId: string,
    paymentMethodId: string,
    deliveryAmount: number,
    baseAmount: number = 0,
    notes?: string
  ): Promise<any> {
    try {
      console.log('🚚 Registrando pago de delivery:', {
        orderId,
        paymentMethodId,
        deliveryAmount,
        baseAmount,
        notes
      });

      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('register_delivery_payment', {
          p_order_id: orderId,
          p_payment_method_id: paymentMethodId,
          p_delivery_amount: deliveryAmount,
          p_base_amount: baseAmount,
          p_notes: notes || null
        });

      if (error) {
        console.error('❌ Error en RPC register_delivery_payment:', error);
        throw new Error(`Error registrando pago de delivery: ${error.message}`);
      }

      console.log('✅ Pago de delivery registrado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error registering delivery payment:', error);
      throw new Error('Error al registrar pago de delivery');
    }
  }

  // Registrar pago completo (pedido + delivery)
  async registerCompletePayment(
    orderId: string,
    paymentMethodId: string,
    totalAmount: number,
    deliveryAmount: number = 0,
    notes?: string
  ): Promise<any> {
    try {
      console.log('💰 Registrando pago completo:', {
        orderId,
        paymentMethodId,
        totalAmount,
        deliveryAmount,
        notes
      });

      const { data, error } = await this.supabaseService
        .getClient()
        .rpc('register_order_payment', {
          p_order_id: orderId,
          p_payment_method_id: paymentMethodId,
          p_total_amount: totalAmount,
          p_delivery_amount: deliveryAmount,
          p_notes: notes || null
        });

      if (error) {
        console.error('❌ Error en RPC register_order_payment:', error);
        throw new Error(`Error registrando pago completo: ${error.message}`);
      }

      console.log('✅ Pago completo registrado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error registering complete payment:', error);
      throw new Error('Error al registrar pago completo');
    }
  }
}
