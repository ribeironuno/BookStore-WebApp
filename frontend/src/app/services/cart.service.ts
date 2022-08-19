import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Book } from '../models/book';
import { CartBook } from '../models/cartBook';
import { CartCheckoutBook } from '../models/cartCheckoutBook';
import { PaymentService } from './payment.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  books: CartBook[] = [];
  cartMessage = new BehaviorSubject<CartBook[]>([]);
  cartCheckoutMessage = new BehaviorSubject<CartCheckoutBook[]>([]);
  public search = new BehaviorSubject<string>('');

  constructor(private paymentService: PaymentService) {}

  /**
   * Searches for a cart book in the array
   */
  indexOf(cartBook: CartBook) {
    let index = -1;

    for (let i = 0; i < this.books.length && index === -1; i++) {
      if (this.books[i].equalsTo(cartBook)) {
        index = i;
      }
    }
    return index;
  }

  /**
   * Associates the local storage array to the main array
   */
  addBookLocalStorage(cartBooks: CartBook[]): void {
    if (this.books.length === 0) {
      for (let i = 0; i < cartBooks.length; i++) {
        //Creates the new cartBook
        let newBook = new CartBook(
          cartBooks[i].title,
          cartBooks[i].ISBN,
          cartBooks[i].condition,
          cartBooks[i].quantity,
          cartBooks[i].price,
          cartBooks[i].subTotal,
          cartBooks[i].image
        );
        this.books.push(newBook);
      }
      this.cartMessage.next(this.books);
    }
  }

  /**
   * Adds a book and triggers the cart subject.
   */
  addBook(
    book: Book,
    condition: string,
    quantity: number,
    pricePerUnit: number
  ): void {
    //Creates the new cartBook object
    let newBook = new CartBook(
      book.title,
      book.ISBN,
      condition,
      quantity,
      pricePerUnit,
      pricePerUnit * quantity,
      book.imageBook.staticUrl
    );

    //If exists increase quantity
    let index = this.indexOf(newBook);
    if (index === -1) {
      this.books.push(newBook);
    } else {
      this.books[index].quantity++;
      this.books[index].subTotal += this.books[index].price;
      this.books[index].subTotal = Number(
        this.books[index].subTotal.toFixed(2)
      );
    }

    //notify the event
    this.cartMessage.next(this.books); //triggers the event
    this.updatesLocalStorage();
  }

  /**
   * Adds one to the quantity
   */
  increaseQuantityByOne(book: CartBook) {
    let index = this.indexOf(book);
    if (index !== -1) {
      this.books[index].quantity++;
      this.books[index].subTotal += this.books[index].price;
      this.books[index].subTotal = Number(
        this.books[index].subTotal.toFixed(2)
      );

      this.cartMessage.next(this.books);
      this.updatesLocalStorage();
    }
  }

  /**
   * Removes one number to the quantity
   */
  decreaseQuantityByOne(book: CartBook) {
    let index = this.indexOf(book);
    if (index !== -1) {
      if (this.books[index].quantity == 1) {
        this.removeBook(book);
      } else {
        this.books[index].quantity--;
        this.books[index].subTotal -= this.books[index].price;
        this.books[index].subTotal = Number(
          this.books[index].subTotal.toFixed(2)
        );

        this.cartMessage.next(this.books);
        this.updatesLocalStorage();
      }
    }
  }

  /**
   * With the books in cart returns the list in the model to insert in DB
   */
  getBooksCheckout() {
    let indexBookMap: Map<string, number> = new Map();

    let books: CartCheckoutBook[] = [];
    for (let i = 0; i < this.books.length; i++) {
      //check if is a book already inserted but in another condition
      let index = indexBookMap.get(this.books[i].ISBN);
      if (index || index == 0) {

        switch (this.books[i].condition) {
          case 'Novo':
            books[index].quantity.new += this.books[i].quantity;
            break;
          case 'Excelente':
            books[index].quantity.excellent += this.books[i].quantity;
            break;
          case 'Bom':
            books[index].quantity.good += this.books[i].quantity;
            break;
          case 'Médio':
            books[index].quantity.medium += this.books[i].quantity;
            break;
          case 'Mau':
            books[index].quantity.bad += this.books[i].quantity;
            break;
        }
        books[index].total += this.books[i].quantity * this.books[i].price;
        books[index].total = Number(books[index].total.toFixed(2));
        continue;
      }

      indexBookMap.set(this.books[i].ISBN, i);

      let quantity = {
        new: 0,
        excellent: 0,
        good: 0,
        medium: 0,
        bad: 0,
      };
      switch (this.books[i].condition) {
        case 'Novo':
          quantity.new = this.books[i].quantity;
          break;
        case 'Excelente':
          quantity.excellent = this.books[i].quantity;
          break;
        case 'Bom':
          quantity.good = this.books[i].quantity;
          break;
        case 'Médio':
          quantity.medium = this.books[i].quantity;
          break;
        case 'Mau':
          quantity.bad = this.books[i].quantity;
          break;
      }
      let newBook = new CartCheckoutBook(
        this.books[i].ISBN,
        this.books[i].subTotal,
        quantity
      );
      books.push(newBook);
    }
    console.log(books);
    return books;
  }

  /**
   * Returns the observable of cart list, when a event occurs than
   * all updated books are updated.
   */
  getBooksEvent(): Observable<CartBook[]> {
    return this.cartMessage.asObservable();
  }

  /**
   * Gets the price.
   */
  getTotalPrice(): number {
    let total: number = 0;
    this.books.forEach((elem) => {
      total += elem.price * elem.quantity;
    });
    return Number(total.toFixed(2));
  }

  /**
   * Removes a book from the cart.
   */
  removeBook(book: CartBook): void {
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].ISBN === book.ISBN) {
        this.books.splice(this.indexOf(book), 1);
        this.cartMessage.next(this.books);

        //if was the last book remove all local storage
        if (this.books.length === 0) {
          localStorage.removeItem('cartBooks');
        } else {
          this.updatesLocalStorage();
        }

        return;
      }
    }
  }

  /**
   * Removes all books in the cart.
   */
  removeAllCart(): void {
    this.books = [];
    this.cartMessage.next(this.books);
    //delete all local storage information
    localStorage.removeItem('cartBooks');
  }

  /**
   * Updates the local storage information
   */
  updatesLocalStorage() {
    localStorage.setItem('cartBooks', JSON.stringify(this.books));
  }
}
