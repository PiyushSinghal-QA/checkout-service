import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'checkout-service',
      uptimeMs: Date.now() - this.startedAt,
    };
  }
}
