import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SaleBook } from '../models/saleBook';
import { Book } from '../models/book';
import { RequestSale } from '../models/requestSale';
import { books } from '../models/requestSale';

const endpoint = 'http://localhost:3000/store/purchases/requestPurchase';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class SaleRequestService {
  books: SaleBook[] = [];
  total!: number;
  cartMessage = new BehaviorSubject<SaleBook[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Searches for a cart book in the array
   */
  indexOf(saleBook: SaleBook) {
    let index = -1;

    for (let i = 0; i < this.books.length && index === -1; i++) {
      if (this.books[i].isbn == saleBook.isbn) {
        index = i;
      }
    }
    return index;
  }

  /**
   * Associates the local storage array to the main array
   */
  addBookLocalStorage(salesBooks: SaleBook[]): void {
    if (this.books.length === 0) {
      for (let i = 0; i < salesBooks.length; i++) {
        //Creates the new cartBook
        let newBook = new SaleBook(
          salesBooks[i].isbn,
          salesBooks[i].title,
          salesBooks[i].total,
          salesBooks[i].imageUrl,
          salesBooks[i].quantity,
          salesBooks[i].prices
        );
        this.books.push(newBook);
      }
      this.cartMessage.next(this.books);
    }
  }

  /**
   * Adds a book and triggers the cart subject.
   */
  addBook(book: Book): void {
    //Quantities of the book to be saled
    let quantities = {
      excellent: 0,
      good: 0,
      medium: 0,
      bad: 0,
    };
    //Prices of the book
    let prices = {
      excellent: book.infoToPurchase.price.excellent,
      good: book.infoToPurchase.price.good,
      medium: book.infoToPurchase.price.medium,
      bad: book.infoToPurchase.price.bad,
    };
    //Creates the new SaleBook object
    let newBook = new SaleBook(
      book.ISBN,
      book.title,
      0,
      book.imageBook.staticUrl,
      quantities,
      prices
    );

    //If exists increase quantity
    let index = this.indexOf(newBook);
    if (index === -1) {
      this.books.push(newBook);
    }

    //notify the event
    this.cartMessage.next(this.books); //triggers the event
    this.updatesLocalStorage();
  }

  editQuantities(book: SaleBook, condition: string, quantity: number) {
    let index = this.indexOf(book);
    switch (condition) {
      case 'Excelente':
        this.books[index].quantity.excellent += quantity;
        this.books[index].quantity.excellent < 0
          ? (this.books[index].quantity.excellent = 0)
          : 0;
        break;
      case 'Bom':
        this.books[index].quantity.good += quantity;
        this.books[index].quantity.good < 0
          ? (this.books[index].quantity.good = 0)
          : 0;
        break;
      case 'Médio':
        this.books[index].quantity.medium += quantity;
        this.books[index].quantity.medium < 0
          ? (this.books[index].quantity.medium = 0)
          : 0;
        break;
      case 'Mau':
        this.books[index].quantity.bad += quantity;
        this.books[index].quantity.bad < 0
          ? (this.books[index].quantity.bad = 0)
          : 0;
        break;
    }
    this.recalculateSubTotal(book);
    this.cartMessage.next(this.books);
    this.updatesLocalStorage();
    this.total = this.getTotalPrice();
  }

  recalculateSubTotal(book: SaleBook) {
    let index = this.indexOf(book);
    this.books[index].total =  Number((
      this.books[index].prices.excellent *
        this.books[index].quantity.excellent +
      this.books[index].prices.good * this.books[index].quantity.good +
      this.books[index].prices.medium * this.books[index].quantity.medium +
      this.books[index].prices.bad * this.books[index].quantity.bad).toFixed(2));
  }

  /**
   * Returns the observable of cart list, when a event occurs than
   * all updated books are updated.
   */
  getBooksEvent(): Observable<SaleBook[]> {
    let booksLocal = JSON.parse(localStorage.getItem('sellBooks')!);

    if (booksLocal != null) {
      let tmpBook: SaleBook;
      let arrayBook: SaleBook[] = [];
      for (let i = 0; i < booksLocal!.length; i++) {
        tmpBook = new SaleBook(
          booksLocal![i].isbn,
          booksLocal[i].title,
          booksLocal[i].total,
          booksLocal[i].imageUrl,
          booksLocal[i].quantity,
          booksLocal[i].prices
        );
        arrayBook.push(tmpBook);
      }
      this.books = arrayBook;
      this.cartMessage.next(this.books);
    }

    return this.cartMessage.asObservable();
  }

  getSaledBooks(): books[] {
    let booksSaled: books[] = [];
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].quantity.excellent > 0) {
        let tmpBook = new books(
          this.books[i].title,
          this.books[i].isbn,
          'Excelente',
          this.books[i].quantity.excellent,
          this.books[i].prices.excellent,
          Number((this.books[i].quantity.excellent * this.books[i].prices.excellent).toFixed(2))
        );
        booksSaled.push(tmpBook);
      }
      if (this.books[i].quantity.good > 0) {
        let tmpBook = new books(
          this.books[i].title,
          this.books[i].isbn,
          'Bom',
          this.books[i].quantity.good,
          this.books[i].prices.good,
          Number((this.books[i].quantity.good * this.books[i].prices.good).toFixed(2))
        );
        booksSaled.push(tmpBook);
      }
      if (this.books[i].quantity.medium > 0) {
        let tmpBook = new books(
          this.books[i].title,
          this.books[i].isbn,
          'Médio',
          this.books[i].quantity.medium,
          this.books[i].prices.medium,
          Number((this.books[i].quantity.medium * this.books[i].prices.medium).toFixed(2))
        );
        booksSaled.push(tmpBook);
      }
      if (this.books[i].quantity.bad > 0) {
        let tmpBook = new books(
          this.books[i].title,
          this.books[i].isbn,
          'Mau',
          this.books[i].quantity.bad,
          this.books[i].prices.bad,
          Number((this.books[i].quantity.bad * this.books[i].prices.bad).toFixed(2))
        );
        booksSaled.push(tmpBook);
      }
    }
    return booksSaled;
  }

  /**
   * Gets the price.
   */
  getTotalPrice(): number {
    let total: number = 0;
    this.books.forEach((elem) => {
      total +=
        elem.prices.excellent * elem.quantity.excellent +
        elem.prices.good * elem.quantity.good +
        elem.prices.medium * elem.quantity.medium +
        elem.prices.bad * elem.quantity.bad;
    });
    return Number(total.toFixed(2));
  }

  /**
   * Removes a book from the cart.
   */
  removeBook(book: SaleBook): void {
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].isbn === book.isbn) {
        this.books.splice(this.indexOf(book), 1);
        this.cartMessage.next(this.books);

        //if was the last book remove all local storage
        if (this.books.length === 0) {
          localStorage.removeItem('sellBooks');
        } else {
          this.updatesLocalStorage();
        }

        return;
      }
    }
  }

  /**
   * Updates the local storage information
   */
  updatesLocalStorage() {
    localStorage.setItem('sellBooks', JSON.stringify(this.books));
  }

  requestSale(requestSale: RequestSale) {
    return this.http.post<RequestSale>(endpoint, requestSale, httpOptions);
  }
}
