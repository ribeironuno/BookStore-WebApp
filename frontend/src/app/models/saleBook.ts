interface quantities {
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

interface prices {
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

export class SaleBook {
  constructor(
    public isbn: string,
    public title: string,
    public total: number,
    public imageUrl: string,
    public quantity: quantities,
    public prices: prices
  ) {}
}
