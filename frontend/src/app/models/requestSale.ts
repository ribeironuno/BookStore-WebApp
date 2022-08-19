interface client {
  nif: string;
}

export class books {
  constructor(
    public title: string,
    public isbn: string,
    public grade: string,
    public quantity: number,
    public pricePerUnit: number,
    public total: number
  ) {}
}

export class RequestSale {
  constructor(
    public client: client,
    public books: books[],
    public totalValue: number
  ) {}
}
