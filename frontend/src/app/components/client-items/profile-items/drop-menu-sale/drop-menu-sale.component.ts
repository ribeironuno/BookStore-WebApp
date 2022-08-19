import { Component, OnInit, Inject } from '@angular/core';
import {
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA
} from '@angular/material/bottom-sheet';
import { SaleBook } from 'src/app/models/saleBook';
import { SaleRequestService } from 'src/app/services/sale-request.service';

@Component({
  selector: 'app-drop-menu-sale',
  templateUrl: './drop-menu-sale.component.html',
  styleUrls: ['./drop-menu-sale.component.css'],
})
export class DropMenuSaleComponent implements OnInit {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      book: SaleBook;
    },
    private bottomSheet: MatBottomSheet,
    private saleService : SaleRequestService
  ) {}

  ngOnInit(): void {}

  openLink(event: MouseEvent): void {
    this.bottomSheet.dismiss();
    event.preventDefault();
  }

  /**
   * Adds a book to the cart.
   */
   editQuantity(book: SaleBook, condition: string, quantity: number) {
    this.saleService.editQuantities(book, condition, quantity);
    this.bottomSheet.dismiss();
  }
}
