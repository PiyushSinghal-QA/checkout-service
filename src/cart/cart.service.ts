import { Injectable, NotFoundException } from '@nestjs/common';

export interface CartItem {
  sku: string;
  name: string;
  price: number; // unit price, in pence
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

/**
 * In-memory cart store. Seeded with a demo cart so the API is usable without a DB.
 */
@Injectable()
export class CartService {
  private readonly carts = new Map<string, Cart>();

  constructor() {
    this.carts.set('demo-cart', {
      id: 'demo-cart',
      items: [
        { sku: 'SKU-WIDGET', name: 'Widget', price: 1999, quantity: 2 },
        { sku: 'SKU-GADGET', name: 'Gadget', price: 4999, quantity: 1 },
      ],
    });
  }

  /** Returns the cart or `undefined` — callers decide how to handle a miss. */
  find(id: string): Cart | undefined {
    return this.carts.get(id);
  }

  /** Returns the cart or throws 404. */
  get(id: string): Cart {
    const cart = this.carts.get(id);
    if (!cart) {
      throw new NotFoundException(`Cart ${id} not found`);
    }
    return cart;
  }

  create(id: string): Cart {
    const cart: Cart = { id, items: [] };
    this.carts.set(id, cart);
    return cart;
  }

  addItem(id: string, item: CartItem): Cart {
    const cart = this.carts.get(id) ?? this.create(id);
    cart.items.push(item);
    return cart;
  }
}
