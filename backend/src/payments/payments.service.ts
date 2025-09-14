import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../lib/supabase.service';

export interface PaymentConfirmation {
  orderId: string;
  paymentMethodId: string;
  amount: number;
  baseAmount?: number;
  surchargeAmount?: number;
  isDeliveryService?: boolean;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Confirma el pago de una orden usando la función process_payment de la base de datos
   * Esta función automáticamente:
   * 1. Inserta el pago en OrderPayment
   * 2. Cambia el estado del pedido a 'PAGADO'
   * 3. Marca isPaid = true
   * 4. Registra el historial de cambios
   */
  async confirmPayment(paymentData: PaymentConfirmation): Promise<{ success: boolean; message: string }> {
    try {
      console.log('💳 PaymentsService.confirmPayment - Iniciando confirmación de pago:', paymentData);

      // Verificar que la orden existe
      const { data: orderData, error: orderError } = await this.supabaseService
        .getClient()
        .from('Order')
        .select('id, orderNumber, status, totalAmount, isPaid')
        .eq('id', paymentData.orderId)
        .single();

      if (orderError || !orderData) {
        console.error('❌ PaymentsService.confirmPayment - Orden no encontrada:', orderError);
        throw new NotFoundException(`Orden con ID ${paymentData.orderId} no encontrada`);
      }

      console.log('🔍 PaymentsService.confirmPayment - Orden encontrada:', {
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        isPaid: orderData.isPaid
      });

      // Verificar que el método de pago existe
      const { data: paymentMethodData, error: paymentMethodError } = await this.supabaseService
        .getClient()
        .from('PaymentMethod')
        .select('id, name')
        .eq('id', paymentData.paymentMethodId)
        .single();

      if (paymentMethodError || !paymentMethodData) {
        console.error('❌ PaymentsService.confirmPayment - Método de pago no encontrado:', paymentMethodError);
        throw new NotFoundException(`Método de pago con ID ${paymentData.paymentMethodId} no encontrado`);
      }

      console.log('🔍 PaymentsService.confirmPayment - Método de pago encontrado:', paymentMethodData);

      // Llamar a la función process_payment de la base de datos
      const { data: rpcData, error: rpcError } = await this.supabaseService
        .getClient()
        .rpc('process_payment', {
          p_order_id: paymentData.orderId,
          p_payment_method_id: paymentData.paymentMethodId,
          p_amount: paymentData.amount,
          p_base_amount: paymentData.baseAmount || paymentData.amount,
          p_surcharge_amount: paymentData.surchargeAmount || 0,
          p_is_delivery_service: paymentData.isDeliveryService || false
        });

      if (rpcError) {
        console.error('❌ PaymentsService.confirmPayment - Error en RPC process_payment:', rpcError);
        throw new Error(`Error procesando pago: ${rpcError.message}`);
      }

      console.log('✅ PaymentsService.confirmPayment - Pago confirmado exitosamente:', rpcData);

      return {
        success: true,
        message: `Pago de $${paymentData.amount} confirmado para orden ${orderData.orderNumber}`
      };

    } catch (error) {
      console.error('❌ PaymentsService.confirmPayment - Error general:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de pagos de una orden
   */
  async getOrderPayments(orderId: string): Promise<any[]> {
    try {
      console.log('🔍 PaymentsService.getOrderPayments - Obteniendo pagos para orden:', orderId);

      const { data, error } = await this.supabaseService
        .getClient()
        .from('OrderPayment')
        .select(`
          id,
          amount,
          baseAmount,
          surchargeAmount,
          isDeliveryService,
          paymentDate,
          createdAt,
          PaymentMethod:paymentMethodId (
            id,
            name
          )
        `)
        .eq('orderId', orderId)
        .order('paymentDate', { ascending: false });

      if (error) {
        console.error('❌ PaymentsService.getOrderPayments - Error:', error);
        throw new Error(`Error obteniendo pagos: ${error.message}`);
      }

      console.log('✅ PaymentsService.getOrderPayments - Pagos obtenidos:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ PaymentsService.getOrderPayments - Error general:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      console.log('🔍 PaymentsService.getPaymentMethods - Obteniendo métodos de pago');

      const { data, error } = await this.supabaseService
        .getClient()
        .from('PaymentMethod')
        .select('id, name, description, isActive')
        .eq('isActive', true)
        .order('name');

      if (error) {
        console.error('❌ PaymentsService.getPaymentMethods - Error:', error);
        throw new Error(`Error obteniendo métodos de pago: ${error.message}`);
      }

      console.log('✅ PaymentsService.getPaymentMethods - Métodos obtenidos:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ PaymentsService.getPaymentMethods - Error general:', error);
      throw error;
    }
  }
}