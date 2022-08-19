export class CartBook {
  constructor(
    public title: string,
    public ISBN: string,
    public condition: string,
    public quantity: number,
    public price: number,
    public subTotal: number,
    public image: string
  ) {}

  //Compares two carts books
  equalsTo(cartBook: CartBook): boolean {
    let isEqual = false;

    if (this === cartBook) {
      return true;
    }

    return this.ISBN === cartBook.ISBN && this.condition === cartBook.condition;
  }
}
