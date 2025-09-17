import { Controller, Get } from '@nestjs/common';

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    return {
      commit: process.env.RENDER_GIT_COMMIT || 'local-development',
      startedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 'unknown',
            version: '3.2',
            status: 'DEPLOYED_WITH_COMBO_FIX'
    };
  }
}
