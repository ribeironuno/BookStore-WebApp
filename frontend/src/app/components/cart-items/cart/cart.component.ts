import { Component, OnInit } from '@angular/core';
import { CartBook } from 'src/app/models/cartBook';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  books: CartBook[] = [];
  total: number = 0;

  constructor(private cart: CartService) {}

  ngOnInit(): void {
    /*
    Subscribe to the "event listener" of cart.
    When a book is updated this cb is called
    */
    this.cart.getBooksEvent().subscribe((books: CartBook[]) => {
      this.books = books;
      this.total = this.cart.getTotalPrice();
    });
  }

  increaseQuantityByOne(book: CartBook) {
    this.cart.increaseQuantityByOne(book);
  }

  decreaseQuantityByOne(book: CartBook) {
    this.cart.decreaseQuantityByOne(book);
  }

  /**
   * Removes a book.
   */
  removeBook(book: CartBook) {
    this.cart.removeBook(book);
  }

  /**
   * Removes all books.
   */
  emptyBook() {
    this.cart.removeAllCart();
  }
}
