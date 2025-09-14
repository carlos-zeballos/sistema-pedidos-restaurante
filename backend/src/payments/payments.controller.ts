import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Confirma el pago de una orden
   * POST /payments/confirm
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('confirm')
  @Roles('CAJA', 'ADMIN')
  async confirmPayment(@Body() paymentData: {
    orderId: string;
    paymentMethodId: string;
    amount: number;
    baseAmount?: number;
    surchargeAmount?: number;
    isDeliveryService?: boolean;
  }) {
    console.log('💳 PaymentsController.confirmPayment - Recibida solicitud:', paymentData);
    return this.paymentsService.confirmPayment(paymentData);
  }

  /**
   * Obtiene el historial de pagos de una orden
   * GET /payments/order/:orderId
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('order/:orderId')
  @Roles('CAJA', 'ADMIN', 'MOZO')
  async getOrderPayments(@Param('orderId') orderId: string) {
    console.log('🔍 PaymentsController.getOrderPayments - Obteniendo pagos para orden:', orderId);
    return this.paymentsService.getOrderPayments(orderId);
  }

  /**
   * Obtiene todos los métodos de pago disponibles
   * GET /payments/methods
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('methods')
  @Roles('CAJA', 'ADMIN', 'MOZO')
  async getPaymentMethods() {
    console.log('🔍 PaymentsController.getPaymentMethods - Obteniendo métodos de pago');
    return this.paymentsService.getPaymentMethods();
  }
}