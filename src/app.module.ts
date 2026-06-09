import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [HealthModule, CartModule, CheckoutModule, ProductsModule],
})
export class AppModule {}
