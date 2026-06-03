import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  cartId!: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
