import { Controller, Get, Query, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ReportsService, PaymentMethodReport, DeliveryPaymentReport, OrderReport, ReportsFilters } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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






