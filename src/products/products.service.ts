import { Injectable } from '@nestjs/common';

export interface Product {
  sku: string;
  name: string;
  price: number; // pence
  emoji: string;
  blurb: string;
}

@Injectable()
export class ProductsService {
  private readonly catalog: Product[] = [
    { sku: 'SKU-WIDGET', name: 'Widget', price: 1999, emoji: '🧩', blurb: 'The dependable classic.' },
    { sku: 'SKU-GADGET', name: 'Gadget', price: 4999, emoji: '🛠️', blurb: 'Premium build, endless utility.' },
    { sku: 'SKU-GIZMO', name: 'Gizmo', price: 999, emoji: '✨', blurb: 'Small, shiny, irresistible.' },
    { sku: 'SKU-DOOHICKEY', name: 'Doohickey', price: 12999, emoji: '🚀', blurb: 'For the power user.' },
  ];

  all(): Product[] {
    return this.catalog;
  }

  find(sku: string): Product | undefined {
    return this.catalog.find((p) => p.sku === sku);
  }
}
