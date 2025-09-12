import { Module } from '@nestjs/common';
import { DiagController } from './diag.controller';
import { DiagService } from './diag.service';

@Module({
  controllers: [DiagController],
  providers: [DiagService],
})
export class DiagModule {}













