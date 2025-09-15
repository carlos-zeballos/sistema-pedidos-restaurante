import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesPublicController } from './tables-public.controller';
import { TablesService } from './tables.service';
import { SupabaseModule } from '../lib/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TablesController, TablesPublicController],
  providers: [TablesService],
  exports: [TablesService]
})
export class TablesModule {}
