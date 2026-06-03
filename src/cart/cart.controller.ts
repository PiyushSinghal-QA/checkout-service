import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CartItem, CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly carts: CartService) {}

  @Get(':id')
  getCart(@Param('id') id: string) {
    return this.carts.get(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() item: CartItem) {
    return this.carts.addItem(id, item);
  }
}
