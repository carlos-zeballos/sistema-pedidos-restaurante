import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { PaymentRequest } from '../types/payment.types';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Obtener métodos de pago disponibles
  @Get('methods')
  async getPaymentMethods() {
    try {
      const methods = await this.paymentsService.getPaymentMethods();
      return { success: true, data: methods };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Registrar un pago
  @Post('register')
  async registerPayment(@Body() paymentRequest: PaymentRequest) {
    try {
      const payment = await this.paymentsService.registerPayment(paymentRequest);
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Registrar pago de delivery específico
  @Post('delivery')
  async registerDeliveryPayment(@Body() body: {
    orderId: string;
    paymentMethodId: string;
    deliveryAmount: number;
    baseAmount?: number;
    notes?: string;
  }) {
    try {
      const payment = await this.paymentsService.registerDeliveryPayment(
        body.orderId,
        body.paymentMethodId,
        body.deliveryAmount,
        body.baseAmount,
        body.notes
      );
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Registrar pago completo (pedido + delivery)
  @Post('complete')
  async registerCompletePayment(@Body() body: {
    orderId: string;
    paymentMethodId: string;
    totalAmount: number;
    deliveryAmount?: number;
    notes?: string;
  }) {
    try {
      const result = await this.paymentsService.registerCompletePayment(
        body.orderId,
        body.paymentMethodId,
        body.totalAmount,
        body.deliveryAmount,
        body.notes
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener reporte de caja por fecha
  @Get('cash-report')
  async getCashReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const report = await this.paymentsService.getCashReportByDate(start, end);
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener reporte de órdenes pagadas
  @Get('paid-orders')
  async getPaidOrdersReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const report = await this.paymentsService.getPaidOrdersReport(start, end);
      return { success: true, data: report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de ventas por hora
  @Get('sales-by-hour')
  async getSalesByHour(@Query('date') date: string) {
    try {
      const targetDate = new Date(date);
      const sales = await this.paymentsService.getSalesByHour(targetDate);
      return { success: true, data: sales };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener resumen del día actual
  @Get('today-summary')
  async getTodaySummary() {
    try {
      const summary = await this.paymentsService.getTodaySummary();
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener resumen de métodos de pago
  @Get('summary')
  async getPaymentSummary() {
    try {
      const summary = await this.paymentsService.getPaymentSummary();
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener pagos de una orden específica
  @Get('order/:orderId')
  async getOrderPayments(@Param('orderId') orderId: string) {
    try {
      const payments = await this.paymentsService.getOrderPayments(orderId);
      return { success: true, data: payments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verificar si una orden está pagada
  @Get('order/:orderId/status')
  async checkOrderPaymentStatus(@Param('orderId') orderId: string) {
    try {
      const isPaid = await this.paymentsService.isOrderPaid(orderId);
      return { success: true, data: { isPaid } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener total de ventas por rango de fechas
  @Get('total-sales')
  async getTotalSales(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const total = await this.paymentsService.getTotalSalesByDateRange(start, end);
      return { success: true, data: { totalSales: total } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
