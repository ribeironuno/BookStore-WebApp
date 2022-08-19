interface clientInformation {
  name: string;
  nif: number;
  cellPhone: number;
  email: string;
  pointsBeforeSale: number;
}

type condition = { [key: string]: number };

interface purchaseBook {
  quantity: condition;
  price: condition;
  imageBook: {
    staticUrl: string;
  };
  title: string;
  isbn: string;
  total: number;
}

interface ShippingInformation {
  freeShipping: boolean;
  cost: Number;
  ShipType: String;
  address: {
    address: String;
    city: String;
    zip: String;
  };
}

export interface ClientPurchase {
  client: clientInformation;
  books: purchaseBook[];
  totalValue: number;
  shippingTye: string;
  pointsToDiscount: number;
  couponCode: number;
  couponPercentage: number;
  totalValueWithDiscount: number;
  discountValuePer100Points: number;
  date: string;
  shippingInformation: ShippingInformation;
  status: String;
  salesId: number;
}
