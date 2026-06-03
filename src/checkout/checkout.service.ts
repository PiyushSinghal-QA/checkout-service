import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { PricingService } from '../pricing/pricing.service';
import { PaymentGateway } from '../payment/payment.gateway';
import { formatMoney } from '../common/money';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly carts: CartService,
    private readonly pricing: PricingService,
    private readonly payment: PaymentGateway,
  ) {}

  async checkout(dto: CheckoutDto) {
    const cart = this.carts.find(dto.cartId);

    // [bug/null-check] removes this guard → `cart.items` below throws → 500.
    if (!cart) {
      throw new NotFoundException(`Cart ${dto.cartId} not found`);
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot check out an empty cart');
    }

    const { subtotal, discount, tax, total } = this.pricing.price(
      cart.items,
      dto.couponCode,
    );

    // [bug/unhandled-error] removes this try/catch → a decline becomes a 500.
    let receipt;
    try {
      receipt = await this.payment.charge({ amount: total, customer: dto.customer });
    } catch (err) {
      throw new BadRequestException(`Payment failed: ${(err as Error).message}`);
    }

    return {
      orderId: receipt.reference,
      cartId: cart.id,
      customer: dto.customer,
      lineItems: cart.items,
      subtotal,
      discount,
      tax,
      total,
      // [bug/typo] ships this key as `formatedTotal` → API consumers read undefined.
      formattedTotal: formatMoney(total),
      status: 'confirmed',
    };
  }
}
