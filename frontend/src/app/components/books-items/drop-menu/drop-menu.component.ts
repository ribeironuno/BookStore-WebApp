import { Component, OnInit, Inject } from '@angular/core';
import {
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { Book } from '../../../models/book';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-drop-menu',
  templateUrl: './drop-menu.component.html',
  styleUrls: ['./drop-menu.component.css'],
})
export class DropMenuComponent implements OnInit {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      book: Book;
    },
    private bottomSheet: MatBottomSheet,
    private cart: CartService
  ) {}

  ngOnInit(): void {}

  openLink(event: MouseEvent): void {
    this.bottomSheet.dismiss();
    event.preventDefault();
  }

  /**
   * Adds a book to the cart.
   */
  addBook(book: Book, condition: string, pricePerUnit: number) {
    console.log(book);
    
    const initialQuantity = 1;
    this.cart.addBook(book, condition, initialQuantity, pricePerUnit);
    this.bottomSheet.dismiss();
  }
}
