import { Controller, Get, Query, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

export interface PaymentMethodReport {
  method: string;
  icon: string;
  color: string;
  ordersCount: number;
  paidByMethod: number;
  originalTotal: number;
  finalTotal: number;
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

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('payments')
  async getPaymentMethodsReport(
    @Query('from') from?: string,
    @Query('to') to?: string
  ): Promise<PaymentMethodReport[]> {
    return this.reportsService.getPaymentMethodsReport(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );
  }

  @Get('delivery-payments')
  async getDeliveryPaymentsReport(
    @Query('from') from?: string,
    @Query('to') to?: string
  ): Promise<DeliveryPaymentReport[]> {
    return this.reportsService.getDeliveryPaymentsReport(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );
  }

  @Get('orders')
  async getOrdersReport(
    @Query() filters: ReportsFilters
  ): Promise<{ orders: OrderReport[]; total: number; page: number; limit: number }> {
    return this.reportsService.getOrdersReport(filters);
  }

  @Delete('orders/:id')
  async softDeleteOrder(
    @Param('id') orderId: string,
    @Body('reason') reason?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.reportsService.softDeleteOrder(orderId, reason);
  }

  @Get('export/orders')
  async exportOrdersReport(
    @Query() filters: ReportsFilters
  ): Promise<{ csv: string; filename: string }> {
    return this.reportsService.exportOrdersReport(filters);
  }
}
