interface author {
  name: String;
  key: String;
}

interface stock {
  new: number;
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

interface stock {
  new: number;
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

interface priceSale {
  new: number;
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

interface infoToSale {
  price: priceSale;
}

interface pricePurchase {
  excellent: number;
  good: number;
  medium: number;
  bad: number;
}

interface infoToPurchase {
  price: pricePurchase;
}

interface imageBook {
  staticUrl: string;
}

interface list {
  nif: number;
  date: string;
  name: string;
  rate: number;
  text: string;
}

interface reviews {
  totalRate: number;
  counterRate: number;
  averageRate: number;
  counters: {
    one: number;
    oneAndHalf: number;
    two: number;
    twoAndHalf: number;
    three: number;
    threeAndHalf: number;
    four: number;
    fourAndHalf: number;
    five: number;
  };
  list: [list];
}

export interface Book {
  title: string;
  edition: number;
  publishYear: string;
  numberPages: number;
  ISBN: string;
  language: string;
  author: author;
  subject: string[];
  stock: stock;
  infoToSale: infoToSale;
  infoToPurchase: infoToPurchase;
  imageBook: imageBook;
  description: string;
  reviews: reviews;
}
