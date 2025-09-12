import { Controller, Get } from '@nestjs/common';
import { DiagService } from './diag.service';

@Controller('diag')
export class DiagController {
  constructor(private readonly svc: DiagService) {}

  @Get()
  async diag() {
    const checks = await this.svc.runAll();
    return {
      ok: checks.every(c => c.ok),
      checks,
      hint: 'Si algún check trae code=42703, corrige el nombre de columna en tu SELECT.',
    };
  }
}












