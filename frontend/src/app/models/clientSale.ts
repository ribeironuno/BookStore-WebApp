interface clientInformation {
  name: string;
  nif: number;
  cellPhone: number;
  email: string;
  pointsBeforePurchase: number;
  pointsAfterPurchase: number;
}

interface saledBook {
  quantity: number;
  pricePerUnit: number;
  title: string;
  isbn: string;
  grade: string;
  total: number;
}

export interface ClientSale {
  client: clientInformation;
  books: saledBook[];
  totalValue: number;
  date: string;
  purchaseId: number;
  status?: string;
}
