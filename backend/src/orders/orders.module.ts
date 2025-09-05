import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SupabaseModule } from '../lib/supabase.module';

@Module({ 
  imports: [SupabaseModule],
  controllers: [OrdersController], 
  providers: [OrdersService] 
})
export class OrdersModule {}


