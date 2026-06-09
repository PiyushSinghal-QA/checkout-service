import { Injectable } from '@nestjs/common';
import { CartItem } from '../cart/cart.service';
import { calcTax } from './tax';

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

@Injectable()
export class PricingService {
  subtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  discount(subtotal: number, couponCode?: string): number {
    if (couponCode === 'SAVE10') {
      return Math.round(subtotal * 0.1);
    }
    return 0;
  }

  price(items: CartItem[], couponCode?: string): PriceBreakdown {
    const subtotal = this.subtotal(items);
    const discount = this.discount(subtotal, couponCode);
    const taxable = subtotal - discount;
    const tax = calcTax(taxable);
    return { subtotal, discount, tax, total: taxable + tax };
  }
}
