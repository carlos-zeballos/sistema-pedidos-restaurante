import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SimpleReportsService } from './simple-reports.service';
import { SupabaseModule } from '../lib/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, SimpleReportsService],
  exports: [ReportsService, SimpleReportsService]
})
export class ReportsModule {}






