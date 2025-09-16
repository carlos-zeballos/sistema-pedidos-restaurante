import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SupabaseModule } from '../lib/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService] // Exportar para usar en otros módulos si es necesario
})
export class PaymentsModule {}