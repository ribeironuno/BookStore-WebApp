interface quantities {
  new: number;
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

export class CartCheckoutBook {
  constructor(
    public isbn: string,
    public total: number,
    public quantity: quantities
  ) {}
}
