import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Rutas públicas (sin autenticación)
  @Get()
  async getOrders(@Query('status') status?: string) {
    return this.ordersService.getOrders(status);
  }

  // Rutas protegidas (con autenticación) - DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('kitchen')
  @Roles('COCINERO', 'MOZO', 'ADMIN')
  async getKitchenOrders() {
    return this.ordersService.getKitchenOrders();
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get('space/:spaceId')
  async getOrdersBySpace(@Param('spaceId') spaceId: string) {
    return this.ordersService.getOrdersBySpace(spaceId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('MOZO', 'ADMIN')
  async createOrder(@Body() createOrderDto: { 
    spaceid: string; 
    createdby: string;
    customername?: string;
    customerphone?: string;
    items: any[]; 
    notes?: string;
    totalamount?: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
  }) {
    // Convertir los nombres de propiedades para que coincidan con el servicio
    const convertedDto = {
      spaceId: createOrderDto.spaceid,
      createdBy: createOrderDto.createdby,
      customerName: createOrderDto.customername,
      customerPhone: createOrderDto.customerphone,
      items: (createOrderDto.items || []).map((it: any) => ({
        productId: it.productId ?? it.productid ?? null,
        comboId: it.comboId ?? it.comboid ?? null,
        name: it.name,
        unitPrice: it.unitPrice ?? it.unitprice ?? 0,
        totalPrice: it.totalPrice ?? it.totalprice ?? 0,
        quantity: it.quantity ?? 1,
        notes: it.notes ?? null,
      })),
      notes: createOrderDto.notes,
      totalAmount: createOrderDto.totalamount,
      subtotal: createOrderDto.subtotal,
      tax: createOrderDto.tax,
      discount: createOrderDto.discount
    };
    return this.ordersService.createOrder(convertedDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/status')
  @Roles('COCINERO', 'MOZO', 'ADMIN')
  async updateOrderStatus(@Param('id') id: string, @Body() statusDto: { 
    status: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
    assignedTo?: string;
    assignedto?: string; // aceptar ambos formatos
  }) {
    const assignedTo = statusDto.assignedTo ?? statusDto.assignedto;
    return this.ordersService.updateOrderStatus(id, statusDto.status, assignedTo);
  }

  // Actualizar datos generales de la orden
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles('MOZO', 'ADMIN')
  async updateOrder(
    @Param('id') id: string,
    @Body()
    dto: {
      spaceId?: string;
      customerName?: string;
      customerPhone?: string;
      notes?: string;
      totalAmount?: number;
      subtotal?: number;
      tax?: number;
      discount?: number;
      assignedTo?: string;
    },
  ) {
    return this.ordersService.updateOrder(id, dto);
  }

  // Eliminar una orden (y sus items por ON DELETE CASCADE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles('MOZO', 'ADMIN')
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }

  // CRUD de Items
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/items')
  @Roles('MOZO', 'ADMIN')
  async addItems(
    @Param('id') orderId: string,
    @Body()
    body: {
      items: Array<{
        productId?: string | null;
        comboId?: string | null;
        name: string;
        unitPrice: number;
        totalPrice: number;
        quantity?: number;
        notes?: string | null;
      }>;
    },
  ) {
    const items = (body.items || []).map((it) => ({
      productId: it.productId ?? null,
      comboId: it.comboId ?? null,
      name: it.name,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      quantity: it.quantity ?? 1,
      notes: it.notes ?? null,
    }));
    return this.ordersService.addOrderItems(orderId, items);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':orderId/items/:itemId')
  @Roles('MOZO', 'ADMIN')
  async updateItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() dto: any,
  ) {
    return this.ordersService.updateOrderItem(orderId, itemId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':orderId/items/:itemId')
  @Roles('MOZO', 'ADMIN')
  async deleteItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.deleteOrderItem(orderId, itemId);
  }

  // Endpoint temporal sin autenticación para pruebas
  @Post('test')
  async createOrderTest(@Body() createOrderDto: { 
    spaceId?: string;
    spaceid?: string;
    createdBy?: string;
    createdby?: string;
    customerName?: string;
    customername?: string;
    customerPhone?: string;
    customerphone?: string;
    items: any[]; 
    notes?: string;
    totalAmount?: number;
    totalamount?: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
  }) {
    // Convertir los nombres de propiedades para que coincidan con el servicio
    // Aceptar tanto camelCase como snake_case
    const convertedDto = {
      spaceId: createOrderDto.spaceId || createOrderDto.spaceid,
      createdBy: createOrderDto.createdBy || createOrderDto.createdby || 'default-user', // Fallback si no viene
      customerName: createOrderDto.customerName || createOrderDto.customername,
      customerPhone: createOrderDto.customerPhone || createOrderDto.customerphone,
      items: createOrderDto.items,
      notes: createOrderDto.notes,
      totalAmount: createOrderDto.totalAmount ?? createOrderDto.totalamount,
      subtotal: createOrderDto.subtotal,
      tax: createOrderDto.tax,
      discount: createOrderDto.discount
    };

    // Validar que los campos requeridos estén presentes
    if (!convertedDto.spaceId) {
      throw new Error('spaceId es requerido');
    }
    if (!convertedDto.createdBy) {
      throw new Error('createdBy es requerido');
    }

    // Asegurar que spaceId y createdBy no sean undefined antes de llamar al servicio
    const validatedDto = {
      spaceId: convertedDto.spaceId!, // El ! asegura que no sea undefined
      createdBy: convertedDto.createdBy!, // El ! asegura que no sea undefined
      customerName: convertedDto.customerName,
      customerPhone: convertedDto.customerPhone,
      items: convertedDto.items,
      notes: convertedDto.notes,
      totalAmount: convertedDto.totalAmount,
      subtotal: convertedDto.subtotal,
      tax: convertedDto.tax,
      discount: convertedDto.discount
    };

    return this.ordersService.createOrder(validatedDto);
  }

  // Endpoint de prueba para agregar items sin autenticación
  @Post('test/:orderId/items')
  async addItemsTest(
    @Param('orderId') orderId: string,
    @Body()
    body: {
      items: Array<{
        productId?: string | null;
        comboId?: string | null;
        name: string;
        unitPrice: number;
        totalPrice: number;
        quantity?: number;
        notes?: string | null;
      }>;
    },
  ) {
    console.log('🧪 Endpoint de prueba - addItemsTest:', { orderId, body });
    try {
      const items = (body.items || []).map((it) => ({
        productId: it.productId ?? null,
        comboId: it.comboId ?? null,
        name: it.name,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        quantity: it.quantity ?? 1,
        notes: it.notes ?? null,
      }));
      
      const result = await this.ordersService.addOrderItems(orderId, items);
      console.log('✅ Resultado de prueba:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en endpoint de prueba:', error);
      return { error: error.message, stack: error.stack };
    }
  }

  // Endpoint de prueba para pagar orden sin autenticación
  @Put('test/:orderId/status')
  async updateOrderStatusTest(
    @Param('orderId') orderId: string,
    @Body() statusDto: { 
      status: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
      assignedTo?: string;
    },
  ) {
    console.log('🧪 Endpoint de prueba - updateOrderStatusTest:', { orderId, statusDto });
    try {
      const result = await this.ordersService.updateOrderStatus(orderId, statusDto.status, statusDto.assignedTo);
      console.log('✅ Resultado de pago:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en endpoint de prueba de pago:', error);
      return { error: error.message, stack: error.stack };
    }
  }

  // Endpoint temporal que simula la creación de orden
  @Post('mock')
  async createOrderMock(@Body() createOrderDto: { 
    spaceid: string; 
    createdby: string;
    customername?: string;
    customerphone?: string;
    items: any[]; 
    notes?: string;
    totalamount?: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
  }) {
    // Simular una orden creada exitosamente
    const mockOrder = {
      id: `mock-${Date.now()}`,
      ordernumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      spaceid: createOrderDto.spaceid,
      customername: createOrderDto.customername || 'Cliente',
      customerphone: createOrderDto.customerphone || '',
      status: 'PENDIENTE',
      totalamount: createOrderDto.totalamount || 0,
      subtotal: createOrderDto.subtotal || 0,
      tax: createOrderDto.tax || 0,
      discount: createOrderDto.discount || 0,
      notes: createOrderDto.notes || '',
      createdby: createOrderDto.createdby,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: createOrderDto.items.map((item, index) => ({
        id: `mock-item-${Date.now()}-${index}`,
        orderid: `mock-${Date.now()}`,
        productid: item.productid,
        name: item.name,
        quantity: item.quantity,
        unitprice: item.unitprice,
        totalprice: item.totalprice,
        status: 'PENDIENTE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };

    console.log('✅ Orden simulada creada:', mockOrder.ordernumber);
    return mockOrder;
  }

  // Endpoint de prueba para diagnosticar problemas
  @Get('test/health')
  async testHealth() {
    try {
      console.log('🧪 Endpoint de prueba de salud llamado');
      
      // Probar conexión básica a la base de datos usando el servicio
      const orders = await this.ordersService.getOrders();
      
      console.log('✅ Prueba de salud exitosa');
      return {
        ok: true,
        message: 'Backend funcionando correctamente',
        ordersCount: orders?.length || 0,
        sampleOrders: orders?.slice(0, 3) || [],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('💥 Error en prueba de salud:', error);
      return {
        ok: false,
        error: 'Error interno del servidor',
        details: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Put(':id/payment-methods')
  async updateOrderPaymentMethods(
    @Param('id') id: string,
    @Body() body: { orderPaymentMethodId: string; deliveryPaymentMethodId?: string }
  ) {
    try {
      const result = await this.ordersService.updateOrderPaymentMethods(
        id,
        body.orderPaymentMethodId,
        body.deliveryPaymentMethodId
      );
      return { success: true, data: result };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':orderId/items/:itemId')
  async removeItemFromOrder(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string
  ) {
    try {
      const result = await this.ordersService.removeItemFromOrder(orderId, itemId);
      return { success: true, data: result };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':orderId/items/:itemId')
  async modifyItemInOrder(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() modifications: any
  ) {
    try {
      const result = await this.ordersService.modifyItemInOrder(orderId, itemId, modifications);
      return { success: true, data: result };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
