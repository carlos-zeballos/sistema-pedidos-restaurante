import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getAllTables() {
    return this.tablesService.getAllTables();
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getTableById(@Param('id') id: string) {
    return this.tablesService.getTableById(id);
  }

  @Post()
  @Roles('ADMIN')
  async createTable(@Body() createTableDto: {
    code: string;
    name: string;
    type: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number;
    isActive?: boolean;
  }) {
    return this.tablesService.createTable(createTableDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateTable(@Param('id') id: string, @Body() updateTableDto: {
    code?: string;
    name?: string;
    type?: 'MESA' | 'BARRA' | 'DELIVERY' | 'RESERVA';
    capacity?: number;
    isActive?: boolean;
    status?: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  }) {
    return this.tablesService.updateTable(id, updateTableDto);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async updateTableStatus(@Param('id') id: string, @Body() statusDto: { 
    status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  }) {
    return this.tablesService.updateTableStatus(id, statusDto.status);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteTable(@Param('id') id: string) {
    return this.tablesService.deleteTable(id);
  }

  // Nuevos endpoints para espacios
  @Get('spaces/all')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getSpaces() {
    return this.tablesService.getSpaces();
  }



  @Get('spaces/:id')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async getSpaceById(@Param('id') id: string) {
    return this.tablesService.getSpaceById(id);
  }

  @Put('spaces/:id/status')
  @Roles('ADMIN', 'MOZO', 'COCINERO', 'CAJA', 'BARRA')
  async updateSpaceStatus(@Param('id') id: string, @Body() statusDto: { 
    status: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO';
  }) {
    return this.tablesService.updateSpaceStatus(id, statusDto.status);
  }
}
