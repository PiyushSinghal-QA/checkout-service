import { Injectable } from '@nestjs/common';

export interface ChargeInput {
  amount: number; // total in pence
  customer: { name: string };
}

export interface Receipt {
  reference: string;
  method: string;
  amount: number;
}

/**
 * Simulated payment service provider. Deterministic by design: a customer named
 * "DECLINE" (any case) is always declined — used to exercise the failure path
 * without any randomness or network calls.
 */
@Injectable()
export class PaymentGateway {
  async charge(input: ChargeInput): Promise<Receipt> {
    if (input.customer?.name?.trim().toUpperCase() === 'DECLINE') {
      throw new Error('card declined by issuer');
    }
    const slug = input.customer.name.replace(/\s+/g, '-').toLowerCase();
    return {
      reference: `pay_${input.amount}_${slug}`,
      method: 'card',
      amount: input.amount,
    };
  }
}
