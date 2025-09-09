import { Controller, Get } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables/public')
export class TablesPublicController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('spaces')
  async getSpaces() {
    return this.tablesService.getSpaces();
  }
}








