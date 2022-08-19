import { CartCheckoutBook } from './cartCheckoutBook';
interface Client {
  nif: number;
}

interface ShippingAddress {
  address?: string;
  city?: string;
  zip?: string;
}

export class Sale {
  constructor(
    public pointsToDiscount: number,
    public totalValueWithDiscount: number,
    public shippingCost: number,
    public couponPercentage: number,
    public couponCode: String,
    public shippingAddress: {
      address?: string;
      city?: string;
      zip?: string;
    },
    public freeShipping: boolean,
    public shippingType?: 'storeAddress' | 'clientAddress' | 'otherAddress',
    public client?: Client,
    public discountValuePer100Points?: number,
    public books?: CartCheckoutBook[],
    public totalValue?: number
  ) {}
}
